import Promise from 'promise'
import gifEncoder from './gifEncoder.js'
import webmEncoder from './webmEncoder.js'
import imageEncoder from './imageEncoder.js'
import ffmpegEncoder from './ffmpegEncoder.js'
import filetypes from './filetypes.js'
import download from '../download.js'
import resizeCanvas from './resizeCanvas.js'

let encoders = {
  gif: gifEncoder,
  webm: webmEncoder,
  png: imageEncoder,
  jpg: imageEncoder,
  ffmpegserver: ffmpegEncoder,
}

export default class SaveService {
  constructor(param) {
    this.param = param;

    let type = encoders[param.type] ? param.type : 'ffmpegserver'

    this.video = new encoders[type]( {
      name: param.filename,
      framerate: param.framerate,
      quality: param.quality,
      format: filetypes[param.type],
    })

    this.ready = Promise.resolve()
  }

  add(canvasOrImage) {
    this.ready = this.ready.then(() => {
      let cout = resizeCanvas(canvasOrImage,this.param.width,this.param.height)
      this.video.add(cout)
      return this.video
    }).catch(e=>{
      console.error(e)
    })
  }

  stop() {
    return this.ready
      .then(() => this.video.stop() )
      .catch(e=>{
        console.error(e)
      })
  }

  post(blob) {
    return this.video.convert(blob)
  }

  save(blob) {
    let url = window.URL.createObjectURL(blob);

    download(url,this.param.filename)

    setTimeout(function(){
      window.URL.revokeObjectURL(url)
    }, 250 )
  }

  cancel() {
    this.video.cancel()
  }
}
