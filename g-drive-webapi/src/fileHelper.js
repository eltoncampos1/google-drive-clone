import fs from 'fs'
import prettyBytes from 'pretty-bytes'

export default class FileHelper {
  static async getFilesStatus(dowloadsFolder) {
    const currentFiles = await fs.promises.readdir(dowloadsFolder)
    const statuses = await Promise.all(
      currentFiles.map((file) => fs.promises.stat(`${dowloadsFolder}/${file}`))
    )

    const filesStatues = []
    for (const fileIndex in currentFiles) {
      const { birthtime, size } = statuses[fileIndex]
      filesStatues.push({
        size: prettyBytes(size),
        file: currentFiles[fileIndex],
        lastModified: birthtime,
        owner: process.env.USER,
      })
    }
    return filesStatues
  }
}
