export class Generation {
  number: number = 0
  count: number = 0
  lastSiblingIndex: number = -1

  constructor(number?: number) {
    this.number = number ?? 0
  }

  decrease = (count = 1) => {
    this.count = this.count - count
  }

  increase = () => {
    this.count = this.count + 1
    this.lastSiblingIndex = this.lastSiblingIndex + 1
    return this.lastSiblingIndex
  }
}
