export default function getLangKey(object, value) {
  return Object.keys(object).find(key => object[key] === value)
}
