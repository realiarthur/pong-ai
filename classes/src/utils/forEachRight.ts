export const forEachRight = <T>(array: T[], callback: (item: T, index: number) => void) => {
  for (let index = array.length - 1; index >= 0; index--) {
    const element = array[index]
    callback(element, index)
  }
}
