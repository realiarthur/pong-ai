import { Intelligence, PlayerClass } from 'classes'
import { useState } from 'react'

const LOCAL_STORAGE_LEADER = 'leader'

export const defaultPlayers = {
  'leader#1.601':
    '{"generation":1,"siblingIndex":601,"weights":[[[],[],[],[],[]],[[-0.1593363538870438,-0.10602585356982397,-0.22211278006350543,0.3912059403353676,-0.0845707313332289],[0.7582490799902324,0.11206104837323627,0.496891693024172,-0.8724295780193203,0.2424264408531993],[-0.5777922334625765,-0.38125422015434207,0.7901267075032341,0.35722494838423957,-0.06709855799944142],[0.0861650275465653,0.2661100312898048,0.3068369760255174,-0.6993682056688129,-0.7641566702617277]],[[0.5403583025379053,-0.9744086634724627,0.8302288466673691,0.7274244317019511],[-0.2213014765122665,-0.876024080969886,-0.43408724282210587,0.7019509360252676]]],"biases":[[-0.31944301745010595,-0.40127802703352433,0.33483861516797364,0.0829732836281698,0.32170004528694696],[0.46024843431524287,-0.39166733799427966,-0.21164218721832118,-0.4119159854473893],[0.41834219743972056,-0.40947438277359005]],"layersConfig":[5,4,2],"birthTime":1709287286915}',
  'leader#44.1045':
    '{"generation":44,"siblingIndex":1045,"weights":[[[],[],[],[],[]],[[0.5687588451498926,0.7454569643509283,-0.2135585574879458,0.8137001327771939,-0.28757208242849097],[-1,0.16965286083951686,-0.622553486979141,1,-0.062272058070887835],[0.5739312991819228,0.36034460105853605,-0.3847189193121983,0.48051210753385754,0.9698468147660715],[-0.8449999994395572,-0.2204409612697262,1,0.48119222833465164,0.16290634323909]],[[-0.7515631785775196,0.9202625778720063,0.34788097357979164,0.46166552530156135],[0.8202501747495199,-0.9737797391110256,0.12399700001892251,-0.6976261272658977]]],"biases":[[0,0,0,0,0],[0.15371686227903758,0.1485744261087498,0.4017037933174133,-0.3738470400276508],[0.2020915449358956,-0.22067830908432426]],"layersConfig":[5,4,2],"birthTime":1709309593444}',
}

export const getSavedPlayers = () =>
  Object.fromEntries(
    Object.entries<string>({ ...defaultPlayers, ...localStorage })
      .filter(([key]) => key.startsWith('leader'))
      .map(([key, value]) => [key.replace('leader', ''), Intelligence.deserialize(value)] as const)
      .filter((value): value is [string, Intelligence] => !!value[0] && !!value[1])
      .sort((a, b) => b[1].birthTime - a[1].birthTime),
  )

export const useSavedPlayers = () => {
  const [players, set] = useState<Record<string, Intelligence>>(getSavedPlayers())

  const savePlayer = (player?: PlayerClass) => {
    if (!player?.brain) return

    const { key } = player.brain
    const value = player.brain.serialize()
    localStorage.setItem(LOCAL_STORAGE_LEADER, value)
    localStorage.setItem(`${LOCAL_STORAGE_LEADER}${key}`, value)
    set({ [key]: player.brain, ...players })
  }

  return [players, savePlayer] as const
}