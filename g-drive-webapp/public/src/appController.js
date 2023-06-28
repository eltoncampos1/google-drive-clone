export default class AppController {
  constructor({ connectionManager, viewManager, dragAndDropManager }) {
    this.connectionManager = connectionManager
    this.viewManager = viewManager
    this.dragAndDropManager = dragAndDropManager
    this.uploadFiles = new Map()
  }

  async initialize() {
    this.viewManager.configureFileBtnClick()
    this.viewManager.configureModal()
    this.viewManager.configureOnFileChange(this.onFileChange.bind(this))
    this.dragAndDropManager.initialize({
      onDropHandler: this.onFileChange.bind(this),
    })
    this.connectionManager.configureEvents({
      onProgress: this.onProgress.bind(this),
    })

    this.viewManager.updateStatus(0)
    await this.updateCurrentfiles()
  }

  async onProgress({ processedAlready, filename }) {
    const file = this.uploadFiles.get(filename)

    const alreadyProcessed = Math.ceil((processedAlready / file.size) * 1000)
    this.updateProgress(file, alreadyProcessed)
    if (alreadyProcessed < 98) {
      return
    }

    return this.updateCurrentfiles()
  }

  updateProgress(file, percent) {
    const uploadedFiles = this.uploadFiles
    file.percent = percent
    const total = [...uploadedFiles.values()]
      .map(({ percent }) => percent ?? 0)
      .reduce((total, curr) => total + curr, 0)

    this.viewManager.updateStatus(total)
  }

  async onFileChange(files) {
    this.uploadFiles.clear()
    this.viewManager.openModal()
    this.viewManager.updateStatus(0)

    const requests = []
    for (const file of files) {
      this.uploadFiles.set(file.name, file)
      requests.push(this.connectionManager.uploadFile(file))
    }
    await Promise.all(requests)
    this.viewManager.updateStatus(100)
    setTimeout(() => {
      this.viewManager.closeModal()
    }, 1000)

    await this.updateCurrentfiles()
  }

  async updateCurrentfiles() {
    const files = await this.connectionManager.currentFiles()
    this.viewManager.updateCurrentFiles(files)
  }
}
