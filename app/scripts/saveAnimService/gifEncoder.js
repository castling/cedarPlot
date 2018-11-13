import Promise from 'progress-promise'

//import GIF from 'gif.js'

//import workerCode from 'raw-loader!gif.js/dist/gif.worker.js'

export default class gifEncoder {
  constructor(opts) {
/*
    var blob = new Blob([ workerCode ], { type: "text/javascript" })
    var worker = URL.createObjectURL(blob)

    this.video = new GIF({
      workerScript: worker,
      workers: Math.min( opts.cpu || 4, navigator.hardwareConcurrency || 4 ),
      repeat: opts.repeat || 0,
    })
    this.delay = 1000 / opts.framerate
*/
    import(
      /* webpackChunkName: 'readwrite-gif' */
      'readwrite-gif'
    ).then(({default: GIF}) => {
      this.video = new GIF.Encoder()
      this.video.setRepeat( opts.repeat || 0)
      this.video.setFrameRate( opts.framerate )
      this.video.start()
    })
  }

  add(canvas) {
    this.video.addFrame(canvas.getContext('2d'))
  }

  stop() {
    return new Promise((resolve,reject) => {
      if( this.video.finish() ) {
        let bin = this.video.stream().getData()
        let array = new Uint8Array(new ArrayBuffer(bin.length))
        for (let i = 0; i < bin.length; i++) {
            array[i] = bin.charCodeAt(i)
        }
        var blob = new Blob([array.buffer], {type:'image/gif'})
        resolve(blob)
      } else {
        reject()
      }
    })
  }

  convert(blob) {
    return Promise.resolve(blob)
  }

  cancel() {
  }
}
