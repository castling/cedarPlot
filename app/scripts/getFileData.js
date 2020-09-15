import Promise from 'progress-promise'
import getChunkFileData from './getChunkFileData.js'
import concatData from './concatData.js'

export default (file,callback,isBinaryReader) => {
  let result = isBinaryReader ? new ArrayBuffer() : []
console.log(file)
  return new Promise((resolve,reject,progress) => {
    getChunkFileData(file,null,null,isBinaryReader)
      .progress(res => {
        result = concatData(result,res.value,isBinaryReader)

        progress({
          state: res.state,
          percentage: res.percentage,
          value: res.value,
        })
      })
      .then(() => {
        resolve(result)
      },e=> {
        reject(e)
      })
  })
}
