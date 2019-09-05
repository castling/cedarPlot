import Promise from 'progress-promise'
import getChunkFileData from './getChunkFileData.js'

export default (file,callback) => {
  let txt = []
  return new Promise((resolve,reject,progress) => {
    getChunkFileData(file)
      .progress(res => {
        txt.push(res.value)
        progress({
          state: res.state,
          percentage: res.percentage,
          value: res.value,
        })
      })
      .then(() => {
        resolve(txt)
      },e=> {
        reject(e)
      })
  })
}

