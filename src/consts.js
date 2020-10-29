/** 队列文件状态 */
export const QF_STATUS = {
  pending: 'pending', // 等待上传
  ready: 'ready', // 准备就绪
  hashing: 'hashing', // 正在计算hash值
  hashed: 'hashed', // 计算hash值完成
  chunking: 'chunking', // 正在进行文件分块
  chunked: 'chunked', // 文件分块完成
  checking: 'checking', // 检测文件状态
  checked: 'checked', // 检测文件状态完成
  uploading: 'uploading', // 正在上传
  abort: 'abort', // 中断
  success: 'success', // 上传成功
  error: 'error' // 上传失败
}
/** 上传类型 */
export const UPLOAD_TYPE = {
  concurrent: 0, // 并发上传
  serial: 1 // 串行上传
}
