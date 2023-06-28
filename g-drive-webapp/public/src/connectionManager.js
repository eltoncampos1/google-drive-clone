export default class ConnectionManager {
  constructor({ apiUrl }) {
    this.apiUrl = apiUrl
  }

  async currentFiles() {
    return await (await fetch(this.apiUrl)).json()
  }
}
