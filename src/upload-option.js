export class UploadOptions {
    url
    name
    data
    headers
    withCredentials
    constructor (url = '', name = 'file', data = {}, headers = {}, withCredentials = false) {
      this.url = url
      this.name = name
      this.data = data
      this.headers = headers
      this.withCredentials = withCredentials
    }
}
