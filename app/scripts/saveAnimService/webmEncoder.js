import Promise from 'progress-promise'

//import Whammy from 'whammy'

export default class webmEncoder {
  constructor(opts) {
    this.param = opts
    import(
      /* webpackChunkName: 'whammy' */
      'whammy'
    ).then(({default: Whammy}) => {
      this.video = new Whammy.Video(opts.framerate,Math.min(this.param.quality,1-1.e-8))
    })
  }

  add(canvas) {
    this.video.add(canvas)
  }

  stop() {
    let blob = this.video.compile()
    return Promise.resolve(blob)
  }

  convert(blob) {
    return Promise.resolve(blob)
  }

  cancel() {
  }
}
