import { Intelligence } from '../Intelligence'

export const getSavedPlayers = () =>
  Object.fromEntries(
    Object.entries({ ...localStorage })
      .filter(([key]) => key.startsWith('leader'))
      .map(([key, value]) => [key.replace('leader', ''), Intelligence.deserialize(value)] as const)
      .filter((value): value is [string, Intelligence] => !!value[0] && !!value[1])
      .sort((a, b) => b[1].birthTime - a[1].birthTime),
  )
