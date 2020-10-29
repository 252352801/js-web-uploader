# js-web-uploader
基于html5的文件上传工具



## 安装

```sh
npm install js-web-uploader --save
```

## 注意

 * 该上传工具仅包含JavaScript部分
 * 支持文件分块上传、断点续传，秒传
 * 内部http请求使用XHR(XMLHttpRequest)对象，文件分块基于Blob.prototype.slice



## 使用说明
使用时需创建一个Uploader实例，假设实例为uploader:
* 批量上传：uploader.upload()
* 单个文件上传 uploader.queue[0].upload()
* 批量暂停：uploader.abort()
* 单个文件上传 uploader.queue[0].abort()
* 文件状态 uploader.queue[0].status (详见附录2)

### 普通上传

```js
import { Uploader } from 'js-web-uploader';
const uploader = new Uploader({
	inputElem: 'uploadInput', // 选择文件的元素
	uploadUrl: '',// 文件上传路径
})
```

### 分块上传
##### 分块上传需计算文件hash值，并将其作为文件的唯一标识，可参考以下思路：
 * 客户端上传文件分块，同时携带所属文件hash值、文件分块数量、分块索引（第几个分块）
 * 服务器接收文件分块并保存分块信息，文件以hash值作为唯一标识
 * 服务器在每个分块上传后检测是否该文件所有分块已经上传，若已上传所有分块，则将分块合并成文件保存，并将获取文件的url返回给客户端

```js
import { Uploader } from 'js-web-uploader';
const uploader = new Uploader({
        inputElem: 'uploadInput', // 选择文件的元素
        uploadUrl: '',// 文件上传路径
        // 填写chunkSize参数触发分块上传
        chunkSize: 1 * 1024 * 1024, // 分块大小,单位byte,可以为数值或function，function参数qf为队列文件(详见附录1)
        // chunkSize: qf=>1 * 1024 * 1024,
        uploadType: 0, // （分块）上传方式 0-并行上传 1-串行上传 默认值：0
        data:{}, // 上传时携带的数据,值可以是对象或funtion（详见附录1）
      })
```

### 断点续传

断点续传基于分块上传，即服务器保存文件已上传分块信息，在上传前获取文件上传状态，将未上传的文件分块继续上传
（继续上传时调用upload方法）

```js
import { Uploader } from 'js-web-uploader';
const uploader = new Uploader({
        // ... 省略其他参数
        /** 检测文件上传状态方法 */
        checkMethod: (qf, resolve) => {
		// 请求文件上传状态
		// 调用 resolve 方法告知已上传分块，传参为数组 例：resolve([0,1,2])
        }
      })

```

### 秒传
在checkMethod里向服务器获取文件上传状态
* 若文件已完成上传，则服务器直接返回文件访问url,客户端在checkMethod里resolve所有分块
* 若未完成上传，则在checkMethod里resolve已上传分块

```js
import { Uploader } from 'js-web-uploader';
const uploader = new Uploader({
        // ... 省略其他参数
		secondUpload:true,
        checkMethod: (qf, resolve) => {
		// ... 请求文件上传状态
		// 已完成上传
		// 调用 resolve 方法告知已上传分块，若分块数量为3，则：resolve([0,1,2])
			resolve([0,1,2])
        }
      })

```
### API
* upload() 上传文件
* setOptions(options) 设置参数
* remove(index) 删除指定下标的文件（queue中的qf）
* on(event,callback) 注册监听事件，详见附录
* trigger(event,...args) 触发指定事件，arg为传入的参数

```js
    // 文件选择时
    uploader.on('select', files => {
      // files-选择的文件列表
    })
    // 移除文件前
    uploader.on('beforeRemove', qfs => {
      // qfs- qf列表
      // 若返回值为 false, 0, '', null中的任一值，则将不执行移除操作
      // 若返回值为Promise实例且resolve false, 0, '', null中的任一值，则将不执行移除操作
    })
    // 移除文件后
    uploader.on('remove', qfs => {
      // qfs- qf列表
    })
    // 超出数量时
    uploader.on('countExceed', (totalCount, maxCount) => {
      // totalCount 总数量
      // maxCount 最大数量
    })
    // 单个文件超出大小限制时
    uploader.on('sizeExceed', (eFiles, maxSize) => {
      // eFiles 超出大小的文件
      // maxSize 文件大小最大值限制
    })
    // 生成分片前
    uploader.on('beforeChunk', qf => {
    })
    // 生成分片后
    uploader.on('beforeChunk', qf => {
    })
    // 生成文件hash值前
    uploader.on('beforeHash', qf => {
    })
    // 生成文件hash值后
    uploader.on('beforeHash', qf => {
    })
    // 进度事件
    uploader.on('progress', (ev, percent) => {
      // ev事件对象
      // percent 单个文件上传百分比
    })
    // 上传成功
    uploader.on('success', (qf,res,chunk) => {
      // qf 详见附录1
      // res 服务器返回结果
      // chunk分块上传时的分块
    })
    // 上传失败
    uploader.on('error', res => {
      // res 发生错误时的结果
    })
```

## 附录1 options

options
```js
     // 示例
     const uploader = new Uploader({
        inputElem: 'uploadInput', // 选择文件的元素
        triggerEvent: 'chuange', // 触发事件 默认change
        uploadUrl: '', // 文件上传路径
        name: 'file', // 上传的文件字段名
        hashFile: true, // 是否计算文件hash值 （默认md5）
        hashMethod: (file) => {
          // 可选计算文件hash值的方法，file为文件对象
          // 需返回一个Promise实例，并resolve计算后的hash值
        },
        uploadType: this.uploadType, // 分块上传时上传方式 0-并行上传 1-串行上传
        chunkSize: (qf) => 1 * 1024 * 1024, // 分块大小 单位byte 数值或function qf为队列文件
        headers: (info) => {
          // 请求头 键值对象或返回键值对象的function,info为分块信息
          return {
            // ...
          }
        },
        data: (info) => {
          // 上传时携带的数据，需返回一个对象
          return {
            // ...
          }
        },
        /** 检测文件上传状态方法 */
        checkMethod: (qf, resolve) => {
          // 请求文件上传状态
          // 调用 resolve 方法告知已上传分块，传参为数组 例：resolve([1,2,3])
        }
      })
```
## 附录2 文件状态
即uploader.queue[0].status
```js
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
```

## 附录3 qf
qf为保存在Uploader实例的queue属性（数组）中的对象,qf是QueueFile的实例
```js
      qf = {
        file: null, // 原始文件对象
        fileHash: '', // 文件哈希值
        chunkSize: 0, // 分块大小
        chunks: [
          // 文件分块信息
          // {
          //   index: 0, // 第几个分块
          //   blob: null, // 分块bob数据
          //   percent: 0, // 上传进度
          //   uploaded: false // 是否已上传
          // }
        ],
        percent: 0, // 上传百分比
        status: 'pending', // 状态 见附录2
        response: '' // 服务器返回
        // ...
      }

```

## 附录4 chunk
文件分块信息,chunk是Chunk的实例
```js
class Chunk {
    queueFile // qf
    index = 0 // 分块索引
    blob // 分块blob数据
    percent = 0 // 上传百分比
    uploaded = false // 是否已经上传
    response = null // 服务器的返回值
	// ...
}

```

## 附录5 info
```js
     info = {
        file: null, // 原始文件对象
        fileHash: '', // 文件哈希值
        chunkSize: 0, // 分块大小
        chunks: [
          // 文件分块信息
          // {
          //   index: 0, // 第几个分块
          //   blob: null, // 分块bob数据
          //   percent: 0, // 上传进度
          //   uploaded: false // 是否已上传
          // }
        ],
        percent: 0, // 上传百分比
        status: 'pending', // 状态 见附录2
        response: '', // 服务器返回
        chunk: null, // 分块的blob数据
        chunkIndex: 0 // 分块索引

        // ...
      }

```

