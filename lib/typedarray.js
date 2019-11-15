import getFuncName from 'get-func-name'
import { truncator, truncate, inspectProperty, inspectList } from './helpers'

const toStringTag = typeof Symbol !== 'undefined' && Symbol.toStringTag ? Symbol.toStringTag : false

const getArrayName = array => {
  // We need to special case Node.js' Buffers, which report to be Uint8Array
  if (typeof Buffer === 'function' && array instanceof Buffer) {
    return 'Buffer'
  }
  if (toStringTag && toStringTag in array) {
    return array[toStringTag]
  }
  return getFuncName(array)
}

export default function inspectTypedArray(array, options) {
  const name = getArrayName(array)
  options.truncate -= name.length + 4
  // Object.keys will always output the Array indices first, so we can slice by
  // `array.length` to get non-index properties
  const nonIndexProperties = Object.keys(array).slice(array.length)
  if (!array.length && !nonIndexProperties.length) return `${name}[]`
  // As we know TypedArrays only contain Unsigned Integers, we can skip inspecting each one and simply
  // stylise the toString() value of them
  let output = ''
  for (const i of array) {
    const string = `${options.stylize(truncate(i, options.truncate), 'number')}${i === array.length ? '' : ', '}`
    options.truncate -= string.length
    if (i !== array.length && options.truncate <= 3) {
      output += `${truncator}(${array.length - i + 1})`
      break
    }
    output += string
  }
  let propertyContents = ''
  if (nonIndexProperties.length) {
    propertyContents = inspectList(nonIndexProperties.map(key => [key, array[key]]), options, inspectProperty)
  }
  return `${name}[ ${output}${propertyContents ? `, ${propertyContents}` : ''} ]`
}