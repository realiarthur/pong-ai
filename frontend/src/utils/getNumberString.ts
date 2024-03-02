export const getNumberString = (value?: number, decimalCount = 3): string => {
  if (value === undefined) return ''
  if (value === 1 || value === -1) return '1'
  if (value === 0) return '0'

  const decimalPart = value.toString().split('.')[1]
  return decimalPart ? `.${decimalPart?.substring(0, decimalCount)}` : '0'
}
