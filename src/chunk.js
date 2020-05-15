import { UploadEvent } from './upload-event'
import { isFn, isPromise, upload } from './utils'
export class Chunk {
    queueFile
    index = 0
    blob
    percent = 0
    uploaded = false
    xhr
    uploadEvent = new UploadEvent()
    response = null
    uploading = false
    constructor (blob, index, qf) {
      this.blob = blob
      this.index = index
      this.queueFile = qf
    }
    onProgress (handler) {
      this.uploadEvent.on('progresss', handler)
    }
    onSuccess (handler) {
      this.uploadEvent.on('success', handler)
    }
    onError (handler) {
      this.uploadEvent.on('error', handler)
    }
    /**
     * 中断请求
     */
    abort () {
      if (this.xhr) {
        this.xhr.abort()
        // this.percent = 0
      }
    }
    setSuccess (res) {
      this.percent = 100
      this.uploaded = true
      this.response = res
      this.uploadEvent.trigger('success', this)
    }
    /**
     * 上传
     * @returns {promise}
     */
    upload (opts) {
      return new Promise(async (resolve, reject) => {
        const info = {
          ...this.queueFile,
          chunk: this.blob,
          chunkIndex: this.index
        }
        let data = isFn(opts.data) ? opts.data.call(this, info) : opts.data
        // 判断是否是fn
        // 是则执行fn 得到结果res
        // 如果结果是一个promise 取promise结果;否则直接取res
        if (isPromise(data)) {
          data = await data
        }
        this.uploading = true
        this.xhr = upload({
          ...opts,
          // file: this.blob,
          file: new File([this.blob], this.queueFile.file.name),
          data: data,
          progress: (ev) => {
            this.status =
            this.percent = this.computePercent(ev.total, ev.loaded)
            this.uploadEvent.trigger('progress', ev)
            if (isFn(this.progresshandler)) {
              this.uploadEvent.trigger('progress', ev)
            }
          },
          success: (res) => {
            this.status = 'success'
            this.uploaded = true
            this.percent = 100
            this.response = res
            this.uploading = false
            this.uploadEvent.trigger('success', res, this)
            resolve(res)
          },
          error: (res) => {
            this.status = 'error'
            this.response = res
            this.uploadEvent.trigger('error', res)
            reject(res)
          }
        })
      })
    }
    computePercent (total, loaded) {
      return Math.round(loaded / total * 10000) / 100
    }
}
