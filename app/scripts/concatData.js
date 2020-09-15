export default (array1,array2,isBinary) => {
  if( isBinary ) {
    let arr = new Uint8Array(array1.byteLength+array2.byteLength)
    arr.set(new Uint8Array(array1),0)
    arr.set(new Uint8Array(array2),array1.length)
    return arr.buffer
  } else {
    return [
      ...array1,
      ...array2,
    ]
  }
}

