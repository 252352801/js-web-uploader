/** 队列文件状态 */
export const QF_STATUS = {
  pending: 0, // 等待上传
  ready: 1, // 准备就绪
  hashing: 2, // 正在计算hash值
  hashed: 3, // 计算hash值完成
  chunking: 4, // 正在进行文件分块
  chunked: 5, // 文件分块完成
  checking: 6, // 检测文件状态
  checked: 7, // 检测文件状态完成
  uploading: 8, // 正在上传
  abort: 9, // 中断
  success: 10, // 上传成功
  error: 11 // 上传失败
}

/** 上传类型 */
export const UPLOAD_TYPE = {
  concurrent: 0, // 并发上传
  serial: 1 // 串行上传
}
