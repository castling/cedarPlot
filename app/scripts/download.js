export default (url,fname) => {
  var a = document.createElement('a')
  a.download = fname;
  a.href = url;

  var e = document.createEvent('MouseEvent')
  e.initEvent('click',true,true)
  a.dispatchEvent(e)
}
