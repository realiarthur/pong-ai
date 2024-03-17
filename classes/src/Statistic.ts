export class GenerationStat {
  number = 0
  count = 0
  dead = 0
  lastSiblingIndex = -1

  constructor(number?: number) {
    this.number = number ?? 0
  }

  decrease = (count = 1) => {
    this.count = this.count - count
    this.dead = this.dead + count
  }

  increase = (count = 1) => {
    this.count = this.count + count
    this.lastSiblingIndex = this.lastSiblingIndex + count
    return this.lastSiblingIndex
  }
}

type IterationStat = {
  ticks: number
  maxGeneration: number
}

export class Statistic {
  generationsStat: Array<GenerationStat | undefined> = []
  population = 0
  currentIterationTicks = 0
  iterations: IterationStat[] = []

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

  getLastGenerationNumber = () => {
    return [...this.generationsStat].reverse().find(item => item?.count)?.number || 0
  }

  newGeneration() {
    const iterationStat: IterationStat = {
      ticks: this.currentIterationTicks,
      maxGeneration: this.getLastGenerationNumber(),
    }
    this.currentIterationTicks = 0
    this.iterations.push(iterationStat)
    console.log(
      `[${this.iterations.length}] ${iterationStat.ticks} frms, maxGen: ${iterationStat.maxGeneration}`,
    )
  }

  tick() {
    this.currentIterationTicks = this.currentIterationTicks + 1
  }
}
