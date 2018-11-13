import Promise from 'progress-promise'
import webmEncoder from './webmEncoder.js'

let convertDataURIToBinary = (dataURI) => {
    let base64 = dataURI.substring(23)
    let raw = window.atob(base64)
    let rawLength = raw.length

    let array = new Uint8Array(new ArrayBuffer(rawLength))
    for (let i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i)
    }
    return array
}

export default class ffmpegEncoder {
  constructor(opts) {

    this.param = opts
    this.files = []

//    this.ready = new Promise((resolve,reject) => {
    this.ready = import(
      /* webpackChunkName: 'ffmpegWorker' */
      'raw-loader!ffmpeg.js/ffmpeg-worker-mp4.js'
    ).then(({default: ffmpegCode}) => {
        return new Promise((resolve,reject,progress) => {
          var blob = new Blob([ ffmpegCode ], { type: 'text/javascript' })
          this.worker = new Worker(URL.createObjectURL(blob))
          this.worker.addEventListener('message',e => {
            var msg = e.data
            switch (msg.type) {
              case 'ready':
                resolve()
                break
            }
          })
        })
      })
  }

  add(canvas) {
    let fname = 'input_'+('0'.repeat(4) + (this.files.length+1)).slice(-4) + '.jpg'
    var dataUri = canvas.toDataURL('image/jpeg', this.param.quality);
    this.files.push({
      name: fname,
      data: convertDataURIToBinary(dataUri),
    })
  }

  stop() {
    return Promise.resolve()
  }

  convert() {
    let args = [
      '-framerate', this.param.framerate.toString(),
      '-i', 'input_\%04d.jpg',
      '-start_number', '1',
      '-vframes', this.files.length.toString(),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-r', this.param.framerate.toString(),
      this.param.name
    ]

    return new Promise((resolve,reject,progress) => {
      return this.ready.then(() => {
        this.worker.addEventListener('message', e => {
          var msg = e.data
          switch (msg.type) {
            case 'done':
              let result = msg.data.MEMFS&&msg.data.MEMFS[0]
              resolve( result && new Blob([result.data.buffer], {type: "application/octet-binary"}))
              this.worker.terminate()
              break
            case 'stdout':
              console.log(msg.data)
              break
            case 'stderr':
              progress(msg.data)
              break
            case 'exit':
              console.log('Process exited with code ' + msg.data)
//              this.worker.terminate()
              break
            case 'error':
              console.error(msg.data)
              reject()
              this.worker.terminate()
              break
          }
        })

        this.worker.postMessage({
          type: 'run',
          arguments: args,
          TOTAL_MEMORY: 268435456,
          MEMFS: this.files,
        })
      })
    })
  }

  cancel() {
    this.worker.terminate()
  }
}
