import { Intelligence } from './Intelligence'

export class GenerationStat {
  number: number = 0
  count: number = 0
  survived: number = 0
  lastSiblingIndex: number = -1

  constructor(number?: number) {
    this.number = number ?? 0
  }

  decrease = (count = 1) => {
    this.count = this.count - count
  }

  increase = (count = 1) => {
    this.count = this.count + count
    this.lastSiblingIndex = this.lastSiblingIndex + count
    return this.lastSiblingIndex
  }

  increaseSurvived = () => {
    this.survived = this.survived + 1
  }

  resetSurvived = () => {
    this.survived = 0
  }
}

export class Statistic {
  generationsStat: Array<GenerationStat | undefined> = []
  population = 0
  survivedCount = 0

  createGeneration = (number: number) => {
    const generation = new GenerationStat(number)
    this.generationsStat[number] = generation
    return generation
  }

  increase = (generationNumber: number, count = 1) => {
    this.population = this.population + count

    const generation =
      this.generationsStat[generationNumber] ?? this.createGeneration(generationNumber)

    const siblingIndex = generation.increase(count)

    return siblingIndex
  }

  decrease = (generationNumber: number) => {
    this.population = this.population - 1
    this.generationsStat[generationNumber]?.decrease()
  }

  increaseSurvived = (generationNumber: number) => {
    this.generationsStat[generationNumber]?.increaseSurvived()
    this.survivedCount = this.survivedCount + 1
  }

  resetSurvived = () => {
    this.generationsStat.forEach(generationNumber => generationNumber?.resetSurvived())
    this.survivedCount = 0
  }

  getLastGenerationNumber = (callback?: (generation: GenerationStat) => void) => {
    return (
      [...this.generationsStat]
        .reverse()
        .find(item => (callback && item ? callback(item) : item?.count))?.number || 0
    )
  }

  hasGeneration = (generationNumber: number) => {
    const generation = this.generationsStat[generationNumber]

    return !!generation && !!generation.count && generation.survived < generation.count
  }
}
