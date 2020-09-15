export default (_offset,_length,_file,_onload,_binaryRead) => {
  let reader = new FileReader()
  let blob = _file.slice(_offset,_length+_offset)
  reader.onload = _onload
  if( _binaryRead ) {
    reader.readAsArrayBuffer(blob)
  } else {
    reader.readAsText(blob)
  }
}

