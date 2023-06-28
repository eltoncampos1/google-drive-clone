import Busboy from 'busboy'
import fs from 'fs'
import { pipeline } from 'stream/promises'

import { logger } from './logger.js'

export default class UploadHandler {
  constructor({ io, socketId, downloadsfolder, messageTimeDelay = 200 }) {
    this.io = io
    this.socketId = socketId
    this.downloadsfolder = downloadsfolder
    this.ON_UPLOAD_EVENT = 'file-upload'
    this.messageTimeDelay = messageTimeDelay
  }

  canExecute(lasExecution) {
    return Date.now() - lasExecution >= this.messageTimeDelay
  }

  handleFileBytes(filename) {
    this.lastMessageSent = Date.now()
    let processedAlready = 0

    async function* handleData(source) {
      for await (const chunk of source) {
        yield chunk
        processedAlready += chunk.length
        if (!this.canExecute(this.lastMessageSent)) {
          continue
        }

        this.lastMessageSent = Date.now()
        this.io
          .to(this.socketId)
          .emit(this.ON_UPLOAD_EVENT, { processedAlready, filename })

        logger.info(
          `File [${filename}] got ${processedAlready} bytes to ${this.socketId}`
        )
      }
    }

    return handleData.bind(this)
  }

  async onFile(fieldName, file, filename) {
    const saveTo = `${this.downloadsfolder}/${filename}`
    await pipeline(
      file,
      this.handleFileBytes.apply(this, [filename]),
      fs.createWriteStream(saveTo)
    )

    logger.info(`File [${filename}] finished.`)
  }

  registerEvents(headers, onFinish) {
    const busboy = new Busboy({ headers })
    busboy.on('file', this.onFile.bind(this))
    busboy.on('finish', onFinish)
    return busboy
  }
}
