import { dirname, resolve } from 'path'
import { fileURLToPath, parse } from 'url'
import { pipeline } from 'stream/promises'

import { logger } from './logger.js'
import FileHelper from './fileHelper.js'
import UploadHandler from './uploadHandler.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultDonwloadsFolder = resolve(__dirname, '../', 'downloads')

export default class Routes {
  constructor(downloadFolder = defaultDonwloadsFolder) {
    this.downloadFolder = downloadFolder
    this.fileHelper = FileHelper
    this.io = {}
  }

  setSocketInstance(io) {
    this.io = io
  }

  async defaultRoute(req, res) {
    res.end('Hello World')
  }

  async options(req, res) {
    res.writeHead(204)
    res.end('Hello World')
  }

  async post(req, res) {
    const { headers } = req
    const {
      query: { socketId },
    } = parse(req.url, true)

    const uploadHandler = new UploadHandler({
      socketId,
      io: this.io,
      downloadsfolder: this.downloadFolder,
    })

    const onFinish = (response) => () => {
      response.writeHead(200)
      const data = JSON.stringify({ result: 'Files uploaded with success!' })

      response.end(data)
    }

    const busboyInstance = uploadHandler.registerEvents(headers, onFinish(res))

    await pipeline(req, busboyInstance)
    logger.info('Request finish with success!')
  }

  async get(req, res) {
    const files = await this.fileHelper.getFilesStatus(this.downloadFolder)

    res.writeHead(200)
    res.end(JSON.stringify(files))
  }

  handler(req, res) {
    res.setHeader('Access-Control-allow-Origin', '*')
    const chosen = this[req.method.toLowerCase()] || this.defaultRoute
    return chosen.apply(this, [req, res])
  }
}
