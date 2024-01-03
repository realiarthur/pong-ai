export const getNumberString = (value?: number, decimalCount = 3): string => {
  if (value === undefined) return ''
  if (value === 1 || value === -1) return '1'
  if (value === 0) return '0'
  return `.${value.toString().split('.')[1].substring(0, decimalCount)}`
}
