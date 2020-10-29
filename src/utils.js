// import md5 from 'js-md5'
let md5
const blobSlice = (() => {
  return (
    File.prototype.slice ||
    File.prototype.mozSlice ||
    File.prototype.webkitSlice
  )
})()
/**
 * md5计算文件hash值
 * @description 依赖 SparkMD5
 * @param {File} file 文件对象
 * @returns {Promise<string>} file hash
 */
export function MD5file(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(blobSlice.call(file))
    fileReader.onload = function (e) {
      if (!md5) {
        md5 = require('js-md5')
      }
      console.log('md5', md5)
      resolve(md5(e.target.result))
    }
    fileReader.onerror = function () {
      reject(new Error('ReadAsArrayBuffer error!'))
    }
  })
}
/**
 * 是否是非空对象
 * @param {*} val
 * @returns boolean
 */
export function isObj(val) {
  return val && typeof val === 'object' && val.toString() === '[object Object]'
}
/**
 * 是否是函数
 * @param {*} fn
 * @returns boolean
 */
export function isFn(fn) {
  return typeof fn === 'function'
}
/**
 * 是否是Promise
 * @param {*} p
 * @returns {boolean}
 */
export function isPromise(p) {
  return p && ((typeof p === 'object' && isFn(p.then)) || p.toString() === '[object Promise]')
}
/**
 * 是否是input元素
 */
export function isInputElem(elem) {
  return elem && elem.nodeType === 1 && elem.nodeName === 'INPUT'
}
/**
 *文件分块
 * @param {File} file
 * @param {number} chunkSize 分块大小
 * @returns {Number}
 */
export function sliceFile(file, chunkSize) {
  if (file instanceof File) {
    const count = Math.ceil(file.size / chunkSize)
    const chunks = []
    let i = 0
    while (i < count) {
      let start = i * chunkSize
      let end = start + chunkSize >= file.size ? file.size : start + chunkSize
      chunks.push(blobSlice.call(file, start, end))
      i++
    }
    return chunks
  }
}
export function upload(opts) {
  // opts = {
  //   name: '',
  //   file: null,
  //   headers: {},
  //   data: {},
  //   url: '',
  //   progress: () => {},
  //   success: () => {},
  //   error: () => {},
  //   withCredentials: false
  // }
  const xhr = new XMLHttpRequest()
  const fd = new FormData()
  fd.append(opts.name, opts.file)
  const data = opts.data
  if (isObj(data)) {
    for (let o in data) {
      fd.append(o, data[o])
    }
  }
  xhr.open('POST', opts.url)
  // 请求头设置
  if (opts.headers) {
    for (let o in opts.headers) {
      xhr.setRequestHeader(o, opts.headers[o])
    }
  }
  if (opts.withCredentials !== undefined) {
    xhr.setRequestHeader('withCredentials', opts.withCredentials)
  }
  xhr.upload.onprogress = ev => {
    if (isFn(opts.progress)) {
      opts.progress.call(this, ev)
    }
  }

  xhr.onload = ev => {
    if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)) {
      if (isFn(opts.error)) {
        opts.error(ev)
      }
    } else {
      if (isFn(opts.success)) {
        const isResJson = xhr.getResponseHeader('Content-type').indexOf('application/json') >= 0
        let res = xhr.responseText
        if (isResJson) {
          try {
            res = JSON.parse(res)
          } catch (err) {
            throw new Error(err)
          }
        }
        opts.success(res)
      }
    }
  }
  xhr.onerror = (ev) => {
    if (isFn(opts.error)) {
      opts.error(ev)
    }
  }
  xhr.send(fd)
  return xhr
}
