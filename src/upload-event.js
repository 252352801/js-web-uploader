import { isFn} from './utils'
export class UploadEvent {
    handlersMap = {
    }
    // static events =[
    //   'select',
    //   'onCountExceed',
    //   'onSizeExceed',
    //   'beforeRemove',
    //   'remove',
    //   'beforeChunk',
    //   'afterChunk',
    //   'beforeHash',
    //   'afterHash',
    //   'beforeChunkUpload',
    //   'chunkUpload',
    //   'chunkProgress',
    //   'chunkSuccess',
    //   'chunkError',
    //   'beforeUpload',
    //   'upload',
    //   'progress,',
    //   'success',
    //   'error'
    // ]
    on (evName, fn) {
      if (!Array.isArray(this.handlersMap[evName])) {
        this.handlersMap[evName] = []
      }
      this.handlersMap[evName].push(fn)
    }
    off (evName, fn) {
      const handlers = this.handlersMap[evName]
      if (Array.isArray(handlers)) {
        const actionIndex = handlers.findIndex(ele => ele === fn)
        if (actionIndex >= 0) {
          handlers.splice(actionIndex, 1)
        }
      }
    }
    trigger (evName, ...args) {
      const handlers = this.handlersMap[evName]
      if (handlers instanceof Array) {
        return handlers.filter(fn => isFn(fn)).map(fn => fn.call(this, ...args))
      }
    }
}
