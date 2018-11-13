import Promise from 'progress-promise'

//import Tar from 'tar-js'

export default class imageEncoder {
  constructor(opts) {
    import(
      /* webpackChunkName: 'tar-js' */
      'tar-js'
    ).then(({default: Tar}) => {
      this.tape = new Tar()
      this.num = 4
      this.step = 0
      this.dfs = []
      this.opts = opts
    })
  }

  add(canvas) {
    this.dfs.push(new Promise((resolve,reject) => {
      this.step += 1
      let fname = 'image_'+('0'.repeat(this.num) + this.step).slice(-this.num) + '.'+this.opts.format.extractedExt
      canvas.toBlob(blob => {
        var reader = new FileReader()
        reader.onload = () => {
          resolve(this.tape.append(fname,new Uint8Array(reader.result)))
        }
        reader.readAsArrayBuffer(blob);
      },this.opts.format.mimetype,this.quality)
    }))
  }

  stop() {
    return Promise.all(this.dfs).then(() => {
      return new Blob([this.tape.out], {type: 'application/octet-binary'})
    })
  }

  convert(blob) {
    return Promise.resolve(blob)
  }

  cancel() {
  }
}
