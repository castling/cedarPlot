let type = d => Object.prototype.toString.call(d).slice(8,-1)

//export default (obj1,obj2,pKey,res) => {
let calc = (obj1,obj2,pKey,res) => {
  res = res || {}

  if( ( type(obj1)==='Object' && type(obj2)==='Object' ) || ( type(obj1)==='Array' && type(obj2)==='Array' ) ) {
    pKey = pKey ? (pKey+'.') : ''
    let keys1 = Object.keys(obj1)
    let keys2 = Object.keys(obj2)

    keys1.filter(key=>keys2.indexOf(key)===-1).forEach(key => res[pKey+key] = obj1[key])
    keys2.filter(key=>keys1.indexOf(key)===-1).forEach(key => res[pKey+key] = null)

    keys1.filter(key=>keys2.indexOf(key)!==-1).forEach(key => {
      res = calc(obj1[key],obj2[key],pKey+key,res)
    })
  } else if( obj1!==obj2 ) {
    res[pKey||''] = obj1
  }
  return res
}
export default calc
