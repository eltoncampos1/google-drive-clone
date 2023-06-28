export default class DragAndDropManager {
  constructor() {
    this.dropArea = document.getElementById('drop-area')
    this.onDropHandler = () => {}
  }

  initialize({ onDropHandler }) {
    this.onDropHandler = onDropHandler
    this.disableAndDropEvents()
    this.enableHighlightOnDrag()
    this.enableDrop()
  }

  disableAndDropEvents() {
    const events = ['dragenter', 'dragover', 'dragleave', 'drop']

    const preventDefaults = (e) => {
      e.preventDefault()
      e.stopPropagation()
    }

    events.forEach((eventname) => {
      this.dropArea.addEventListener(eventname, preventDefaults, false)
      document.body.addEventListener(eventname, preventDefaults, false)
    })
  }

  enableHighlightOnDrag() {
    const events = ['dragenter', 'dragover']

    const highlight = (e) => {
      this.dropArea.classList.add('highlight', 'drop-area')
    }

    events.forEach((eventname) => {
      this.dropArea.addEventListener(eventname, highlight, false)
    })
  }

  enableDrop(e) {
    const drop = (e) => {
      this.dropArea.remove('drop-area')

      const { files } = e.dataTransfer

      return this.onDropHandler(files)
    }

    this.dropArea.addEventListener('drop', drop, false)
  }
}
