export default (icanvas,w,h) => {
  let canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(icanvas,0,0,icanvas.width,icanvas.height,0,0,w,h)
  return canvas
}
