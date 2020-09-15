import Promise from 'progress-promise'
import blockReader from './blockReader.js'

export default (file,callback,finishCallback,binaryRead) => {
  var fileSize = file.size
  var chunkSize = 1024 * 1024
  var offset = 0

  return new Promise((resolve,reject,progress) => {
    let onload = (e) => {
      if( e.target.error==null ) {
        offset += e.loaded
        progress({
          state: 'loading',
          percentage: Math.round(offset/fileSize*100),
          value: e.target.result,
        })
      } else {
        console.log('read error:'+e.target.error)
        reject(e.target.error)
        return
      }
      if( offset >= fileSize ) {
        resolve()
        return
      }

      blockReader(offset,chunkSize,file,onload,binaryRead)
    }

    blockReader(offset,length,file,onload,binaryRead)
  })
}
