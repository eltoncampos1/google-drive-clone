import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import { logger } from './logger.js'
import FileHelper from './fileHelper.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultDonwloadsFolder = resolve(__dirname, '../', 'downloads')

export default class Routes {
  constructor(downloadFolder = defaultDonwloadsFolder) {
    this.downloadFolder = downloadFolder
    this.fileHelper = FileHelper
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
    logger.info('post')
    res.end()
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
