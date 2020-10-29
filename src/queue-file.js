import { Chunk } from './chunk'
import { MD5file, sliceFile } from './utils'
import { UPLOAD_TYPE, QF_STATUS } from './consts'
import { UploadEvent } from './upload-event'
/** 队列文件 */
export class QueueFile {
  /** 文件对象 */
  file = null
  /** 文件哈希值 */
  fileHash = ''
  /** 压缩后的文件 */
  compressFile = null
  /** 文件的base64数据 */
  fileBase64Data = ''
  /** 压缩后的文件base64数据 */
  compressFileBase64Data = ''
  /** 分块大小 */
  chunkSize = 0
  /** 上传方式 */
  uploadType = UPLOAD_TYPE.serial
  /** 分块数据 */
  chunks = [
    // {
    //   index: 0, // 第几个分块
    //   blob: null, // 分块bob数据
    //   percent: 0, // 上传进度
    //   uploaded: false // 是否已上传
    // }
  ]
  /** 上传百分比 */
  percent = 0
  /** 状态 <string>  pending待处理 ready就绪 progress上传中 success上传成功 error上传失败 */
  status = QF_STATUS.pending
  /** 服务器返回 */
  response = ''
  /** 上传时参数 */
  uploadOptions = null
  /** 是否获取文件hash值 */
  isHashFile = false
  /** hash方法 */
  hashMethod = null
  uploadEvent = new UploadEvent()
  checkMethod = null
  constructor(opts) {
    for (let o in opts) {
      if (this.hasOwnProperty(o)) {
        this[o] = opts[o]
      }
    }
  }
  /**
   * 初始化分块列表
   */
  initChunks() {
    this.uploadEvent.trigger('beforeChunk', this)
    this.changeStatus(QF_STATUS.chunking)
    let chunkSize = 0
    if (typeof this.chunkSize === 'function') {
      chunkSize = this.chunkSize(this.file)
    } else {
      chunkSize = this.chunkSize
    }
    const wouldSlice = typeof chunkSize === 'number' && chunkSize > 0
    // 文件分块
    if (wouldSlice) {
      this.chunks = (sliceFile(this.file, chunkSize) || []).map(
        (blob, index) => {
          const chunk = new Chunk(blob, index, this)
          return chunk
        }
      )
    } else {
      //
      this.chunks = [new Chunk(this.file, 0, this.file)]
    }
    this.chunks.forEach(chunk => {
      this.subscribeChunkEvens(chunk)
    })
    this.uploadEvent.trigger('afterChunk', this)
    this.changeStatus(QF_STATUS.chunked)
  }
  /**
   * 订阅分块对象的事件
   * @param {Chunk} chunk
   */
  subscribeChunkEvens(chunk) {
    chunk.onProgress(ev => {
      this.computePercent()
      this.uploadEvent.trigger('progress', ev, this.percent)
    })
    chunk.onSuccess((...args) => {
      this.computePercent()
      if (this.testIsSuccess()) {
        this.changeStatus(QF_STATUS.success)
      }
      if (this.chunkSize > 0 && this.chunks.length > 1) {
        this.uploadEvent.trigger('success', this, ...args)
      } else {
        this.uploadEvent.trigger('success', this)
      }
    })
    chunk.onError(ev => {
      this.changeStatus(QF_STATUS.error)
      this.uploadEvent.trigger('error', ev)
    })
  }
  /**
   * 监听上传进度事件
   * @param {function} fn
   */
  onProgress(fn) {
    this.uploadEvent.on('progress', fn)
  }
  /**
   * 监听成功事件
   * @param {function} fn
   */
  onSuccess(fn) {
    this.uploadEvent.on('success', fn)
  }
  /**
   * 监听失败事件
   * @param {function} fn
   */
  onError(fn) {
    this.uploadEvent.on('error', fn)
  }
  /**
   * 分片之前
   * @param {function} fn
   */
  beforeChunk(fn) {
    this.uploadEvent.on('beforeChunk', fn)
  }
  /**
   * 分片之后
   * @param {function} fn
   */
  afterChunk(fn) {
    this.uploadEvent.on('afterChunk', fn)
  }
  /**
   * hash之前
   * @param {function} fn
   */
  beforeHash(fn) {
    this.uploadEvent.on('beforeHash', fn)
  }
  /**
   * hash之后
   * @param {*} fn
   */
  afterHash(fn) {
    this.uploadEvent.on('afterHash', fn)
  }
  /**
   * 计算百分比进度
   *  @param {*} fn
   */
  computePercent() {
    this.percent = Math.round(this.chunks.map(chunk => chunk.percent).reduce((a, b) => a + b) / this.chunks.length * 100) / 100
  }
  /** 检测是否上传成功 */
  testIsSuccess() {
    return this.chunks.every(chunk => chunk.uploaded && chunk.percent >= 100)
  }
  /**
   * 上传
   */
  async upload() {
    if (this.status !== QF_STATUS.abort) {
      if (!this.chunks.length) {
        this.initChunks()
      }
      if (this.isHashFile) {
        await this.hashFile()
      }
      let uploadedAll = false
      if (typeof this.checkMethod === 'function') {
        uploadedAll = await this.checkUploaded()
      }
      if (uploadedAll) {
        this.changeStatus(QF_STATUS.success)
        return
      }
    }
    this.changeStatus(QF_STATUS.uploading)
    switch (this.uploadType) {
      case UPLOAD_TYPE.concurrent: // 并行上传
        this.concurrentUpload()
        return Promise.resolve(this)
      case UPLOAD_TYPE.serial: // 串行上传
        return this.serialUpload()
    }
  }
  checkUploaded() {
    return new Promise(resolve => {
      this.changeStatus(QF_STATUS.checking)
      const cb = (statusArr, res) => {
        let allSuccess = true
        if (statusArr instanceof Array && statusArr.length === this.chunks.length) {
          statusArr.forEach((s, i) => {
            if (s) {
              this.chunks[i].setSuccess(res)
            } else {
              allSuccess = false
            }
          })
        } else {
          allSuccess = false
        }
        this.changeStatus(QF_STATUS.checked)
        resolve(allSuccess)
      }
      this.checkMethod(this, cb)
    })
  }
  /**
   * 改变状态
   * @param {*} status
   */
  changeStatus(status) {
    this.status = status
  }
  /**
   * 并行上传
   * @param {boolean} 是否从开始位置上传
   */
  concurrentUpload(isStart) {
    this.chunks.forEach(chunk => {
      chunk.upload(this.uploadOptions).catch(() => {
        // 有一个分块上传失败，立即中止其他分块的上传
        this.abort()
        this.changeStatus(QF_STATUS.error)
      })
    })
  }
  /**
   * 串行上传
   * @param {boolean} 是否从开始位置上传
   */
  serialUpload(isStart) {
    return new Promise(resolve => {
      const fn = async index => {
        if (index < this.chunks.length && index >= 0) {
          const success = await this.uploadChunk(index).catch(() => {
            this.changeStatus(QF_STATUS.error)
            return false
          })
          if (!success) return
          const newIndex = this.chunks.findIndex(ele => !ele.uploaded)
          if (newIndex >= 0) {
            fn(newIndex)
          } else {
            resolve(this.chunks)
          }
        }
      }
      const index = isStart ? 0 : this.chunks.findIndex(ele => !ele.uploaded)
      if (index >= 0) {
        fn(index)
      }
    })
  }
  /**
   *上传指定分块
   *@param {number} index
   */
  uploadChunk(index) {
    return this.chunks[index].upload(this.uploadOptions)
  }
  /**
   * 中止
   */
  abort() {
    this.changeStatus(QF_STATUS.abort)
    this.computePercent()
    this.chunks.filter(ck => ck.uploading).forEach(chk => {
      chk.abort()
    })
  }
  /**
   * 计算文件哈希值
   */
  hashFile() {
    this.uploadEvent.trigger('beforeHash', this)
    this.changeStatus(QF_STATUS.hashing)
    const method = typeof this.hashMethod === 'function' ? this.hashMethod : MD5file
    return method(this.file)
      .then(res => {
        this.fileHash = res
        this.uploadEvent.trigger('afterHash', this)
        this.changeStatus(QF_STATUS.hashed)
        return res
      })
  }
}
