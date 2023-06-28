export default class AppController {
  constructor({ connectionManager, viewManager }) {
    this.connectionManager = connectionManager
    this.viewManager = viewManager

    this.uploadFiles = new Map()
  }

  async initialize() {
    this.viewManager.configureFileBtnClick()
    this.viewManager.configureOnFileChange(this.onFileChange.bind(this))
    this.connectionManager.configureEvents(() => {})
    await this.updateCurrentfiles()
  }

  async onFileChange(files) {
    const requests = []
    for (const file of files) {
      this.uploadFiles.set(file.name, file)
      requests.push(this.connectionManager.uploadFile(file))
    }

    await Promise.all(requests)

    await this.updateCurrentfiles()
  }

  async updateCurrentfiles() {
    const files = await this.connectionManager.currentFiles()
    this.viewManager.updateCurrentFiles(files)
  }
}
