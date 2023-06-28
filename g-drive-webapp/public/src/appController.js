export default class AppController {
  constructor({ connectionManager, viewManager }) {
    this.connectionManager = connectionManager
    this.viewManager = viewManager
  }

  async initialize() {
    await this.updateCurrentfiles()
  }

  async updateCurrentfiles() {
    const files = await this.connectionManager.currentFiles()
    this.viewManager.updateCurrentFiles(files)
  }
}
