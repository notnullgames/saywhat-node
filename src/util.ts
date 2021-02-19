// https://github.com/nathanhoad/SayWhat/blob/master/renderer/lib/util.ts

/**
 * Convert an array of objects to an object using keys from the items
 * @param key
 * @param array
 */
export function keyBy<T> (key: string, array: T[]): { [key: string]: T } {
  if (!array) return {}

  const map: any = {}
  array.forEach((item: any) => {
    map[item[key]] = item
  })

  return map
}