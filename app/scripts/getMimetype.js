function range(start, end) {
  return [...Array(end-start+1)].map((d,i)=>i+start)
}

const textChars = [7, 8, 9, 10, 12, 13, 27, ...range(0x20, 0xff)];
const isText = array => array.every(e => textChars.includes(e));

export default arrbuff => {
  let array = new Uint8Array(arrbuff)
  let header = array.subarray(0,150).reduce((x,i)=>x+i.toString(16),'');
  let retv
  switch (true) {
    case isText(array):
      retv = 'text/plain';
      break;
    case header.startsWith('89504e47'):
      retv = 'image/png';
      break;
    case header.startsWith('424d'):
      retv = 'image/bmp';
      break;
    case header.startsWith('47494638'):
      retv = 'image/gif';
      break;
    case header.startsWith('ffd8ff'):
      retv = 'image/jpeg';
      break;
    case header.startsWith('25504446'):
      retv = 'application/pdf';
      break;
    default:
      retv = 'unknown';
      break;
  }
  return retv
}
