import { isObj, isPromise, isInputElem } from './utils'
import { UploadOptions } from './upload-option'
import { UploadEvent } from './upload-event'
import { QueueFile } from './queue-file'
import { UPLOAD_TYPE, QF_STATUS } from './consts'
export class Uploader {
  /** 上传file Input */
  inputElem = null
  /** 上传队列 */
  queue = []
  /** 分块大小 */
  chunkSize = 0
  /** 分块的上传方式 默认并发上传 */
  uploadType = UPLOAD_TYPE.concurrent
  /** 上传地址 */
  uploadUrl = ''
  /** 是否压缩 */
  compress = false
  /** 压缩配置参数 */
  compressConfig = {
    scale: 1,
    quality: 1
  }
  /** 请求头 */
  headers = {}
  /** 上传时的额外参数，key&value对象或者一个返回key&value对象的函数 如果是函数，函数的参数为 file,chunk,chunkCount,chunkIndex */
  data = {}
  /** 上传的文件字段名 */
  name = 'file'
  /** 支持发送 cookie 凭证信息 */
  withCredentials = false
  /** 已上传的文件列表 */
  fileList = []
  /** 最大个数限制 */
  maxCount = 100
  /** 单个文件大小限制 */
  maxSize = 0
  /** 是否自动上传 */
  autoUpload = false
  /** 触发事件 */
  triggerEvent = 'change'
  /** 上传事件处理 */
  uploadEvent = new UploadEvent()
  // /** 各个钩子函数 */
  // handlers = {
  //   countExceed: [], // 传入参数依次为 totalCount,maxCount, files
  //   sizeExceeded: [], // totalCount, maxCount, files
  //   select: [], // files
  //   beforeRemove: [],
  //   remove: [],
  //   beforeUpload: [],
  //   progress: [],
  //   success: [],
  //   error: []
  // }
  // 是否计算文件hash值
  hashFile = false
  /** 默认算法MD5 */
  hashMethod = null
  /** 检测上传状态的方法 传入参数（file） resolve状态列表 如[0,0,0,1,1,1] */
  checkMethod = null
  constructor(opts) {
    if (isObj(opts)) {
      for (let o in opts) {
        if (this.hasOwnProperty(o)) {
          this[o] = opts[o]
        }
        if (o === 'uploadType') {
          this.setUploadType(opts[o])
        }
      }
    }
    if (isInputElem(this.inputElem)) {
      this.inputElem.addEventListener(this.triggerEvent, async ev => {
        ev = ev || window.event
        const target = ev.target || ev.srcElement
        const files = target.files
        if (files && files.length) {
          const selectResults = this.trigger('select', files)
          // 有监听且执行结果不全为真时，中止
          if (!await this.canContinueAfterTrigger(selectResults)) return
          // 检查文件数量是否超出
          if (!this.checkCountExceed(files)) return
          // 检查文件大小是否超出
          if (!this.checkSizeExceed(files)) return
          this.initQueue(files)
          if (this.autoUpload) {
            this.upload()
          }
        }
      })
    }
  }
  /**
   * 初始化队列
   * @param {File[]} files 文件对象列表
   */
  initQueue(files) {
    const len = files.length > this.maxCount ? this.maxCount : files.length
    Array.prototype.forEach.call(files, (file, index) => {
      if (index >= len) return false
      const qf = new QueueFile({
        file,
        isHashFile: !!this.hashFile,
        hashMethod: this.hashMethod,
        checkMethod: this.checkMethod,
        uploadType: this.uploadType
      })
      qf.chunkSize = this.chunkSize
      qf.changeStatus(QF_STATUS.ready)
      qf.uploadOptions = new UploadOptions(this.uploadUrl, this.name, this.data, this.headers, this.withCredentials)
      this.subscribeQueueFileEvents(qf)
      this.queue.push(qf)
    })
  }
  /**
   *订阅队列文件的事件
   * @param {QueueFile} qf
   */
  subscribeQueueFileEvents(qf) {
    const trigger = (evName) => (...args) => this.trigger(evName, ...args)
    qf.beforeChunk(trigger('beforeChunk'))
    qf.afterChunk(trigger('afterChunk'))
    qf.beforeHash(trigger('beforeHash'))
    qf.afterHash(trigger('afterHash'))
    qf.onProgress(trigger('progress'))
    qf.onSuccess(trigger('success'))
    qf.onError(trigger('error'))
  }
  /**
   * 监听事件
   * @param {string} evName
   * @param {function} action
   */
  on(evName, action) {
    this.uploadEvent.on(evName, action)
  }
  /**
   * 触发事件
   * @param {string} evName
   * @param  {...any} args
   */
  trigger(evName, ...args) {
    return this.uploadEvent.trigger(evName, ...args)
  }
  /**
   * 文件选定时
   * @param {function} fn
   */
  onSelect(fn) {
    this.on('select', fn)
  }
  /**
   * 移除文件之前
   * @param {function} fn
   */
  beforeRemove(fn) {
    this.on('beforeRemove', fn)
  }
  /**
   * 移除文件时
   * @param {function} fn
   */
  onRemove(fn) {
    this.on('remove', fn)
  }
  /**
   * 上传文件之前
   * @param {function} fn
   */
  beforeUpload(fn) {
    this.on('beforeUpload', fn)
  }
  /**
   * 上传成功时
   * @param {function} fn
   */
  onSuccess(fn) {
    this.on('success', fn)
  }
  /**
   * 上传文件失败时
   * @param {function} fn
   */
  onError(fn) {
    this.on('error', fn)
  }
  /**
   * 文件超出数量时
   * @param {function} fn
   */
  onCountExceed(fn) {
    this.on('countExceed', fn)
  }
  /**
   * 文件超出大小时
   * @param {function} fn
   */
  onSizeExceed(fn) {
    this.on('sizeExceed', fn)
  }
  /**
   * 上传文件进度
   * @param {function} fn
   */
  onProgress(fn) {
    this.on('progress', fn)
  }
  /** 分片之前 */
  beforeChunk(fn) {
    this.on('beforeChunk', fn)
  }
  /**
   * 分片之后
   * @param {function} fn
   */
  afterChunk(fn) {
    this.on('afterChunk', fn)
  }
  /**
   * hash之前
   * @param {function} fn
   */
  beforeHash(fn) {
    this.on('beforeHash', fn)
  }
  /**
   *hash之后
   * @param {*} fn
   */
  afterHash(fn) {
    this.on('afterHash', fn)
  }
  setOptions(opts) {
    Object.keys(opts).forEach(k => {
      if (this.hasOwnProperty(k) && typeof opts[field] !== 'function') {
        this[k] = opts[k]
      }
    })
  }
  /**
   * 触发事件后是否可继续
   * @param {*} res 触发后的返回结果
   */
  async canContinueAfterTrigger(res) {
    if (res instanceof Array) {
      const canContinueList = await Promise.all(res.map(r => {
        const val = isPromise(r) ? r : this.isContinue(r)
        return Promise.resolve(val)
      }))
      if (!canContinueList.every(ele => !!ele)) {
        return false
      }
    }
    return true
  }
  /** 提交 */
  async upload() {
    const beforeUploadRes = this.trigger('beforeUpload', this.queue)
    const canContinue = await this.canContinueAfterTrigger(beforeUploadRes)
    if (!canContinue) return
    switch (this.uploadType) {
      case UPLOAD_TYPE.concurrent:
        this.concurrentUpload()
        break
      case UPLOAD_TYPE.serial:
        this.serialUpload()
        break
    }
  }
  /**
   * 并行上传
   */
  async concurrentUpload() {
    this.queue.forEach(async qf => {
      // 生成hash值
      qf.upload()
    })
  }
  /**
   * 串行上传
   */
  serialUpload() {
    const fn = async index => {
      const qf = this.queue[index]
      await qf.upload()
      const newIndex = index + 1
      if (newIndex < this.queue.length) {
        fn(newIndex)
      }
    }
    fn(0)
  }
  /** 中断上传 */
  abort() {
    this.QueueFile.forEach(qf => {
      qf.abort()
    })
  }
  /**
   * 根据函数返回值判断是否继续执行
   * @param {*} returnVal
   * @returns {Boolean}
   */
  async isContinue(returnVal) {
    const invalidValues = [false, 0, '', null]
    return !invalidValues.some(val => val === returnVal)
  }
  /**
   * 检测文件数量
   * @param {File[]} files 文件列表
   * @returns {Boolean} 是否继续执行
   */
  checkCountExceed(files) {
    const totalCount = files.length + this.queue.length
    if (this.maxCount && files.length && totalCount > this.maxCount) {
      this.trigger('countExceed', totalCount, this.maxCount)
      return false
    }
    return true
  }
  /**
   * 检测单个文件大小
   * @param {File[]} files 文件列表
   * @returns {Boolean} 是否继续执行
   */
  checkSizeExceed(files) {
    if (!this.maxSize) return true
    const eFiles = files.filter(ele => ele.size > this.maxSize)
    if (eFiles.length) {
      this.trigger('sizeExceed', eFiles, this.maxSize)
      return false
    }
  }
  /**
   * 删除指定下标的队列文件
   * @param {number} index
   */
  async remove(index) {
    const beforeRemoveRes = this.trigger('beforeRemove', this.queue)
    const canContinue = await this.canContinueAfterTrigger(beforeRemoveRes)
    if (canContinue) {
      this.queue.splice(index, 1)
      this.trigger('remove', this.queue)
    }
  }
  /**
   * 设置上传方式
   * @param {*} val
   */
  setUploadType(val) {
    this.uploadType = +val
  }
}

// export function reactive(data, callback) {
//   function reactObj(obj, path) {
//     if (Array.isArray(obj)) {
//       // push shit unshit pop splice
//       // 数组响应
//     } else if (obj && typeof obj === 'object') {
//       const keys = Object.keys(obj)
//       keys.forEach(key => {
//         let val = obj[key]
//         if (!(Array.isArray(val) || (val && typeof val === 'object'))) {
//           Object.defineProperty(obj, key, {
//             get() {
//               return val
//             },
//             set(newVal) {
//               if (typeof callback === 'function') {
//                 callback(data, path || key)
//               }
//               val = newVal
//             }
//           })
//         } else {
//           reactObj(val, path ? path + '.' + key : key)
//         }
//       })
//     } else {
//       return obj
//     }
//   }
//   reactObj(data)
//   data = null
//   callback = null
// }
