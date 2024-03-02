import { getConfig } from 'classes'
import { useEffect } from 'react'

const { ballDiameter, boardWidth, boardHeight, boardPadding, paddleHeight, paddleWidth } =
  getConfig()

const root = document.documentElement
export let boardScreenRatio = 1

const calcBoardScreenRatio = () => {
  const widthRatio = root.clientWidth / boardWidth
  const heightRatio = (root.clientHeight - 50) / boardHeight
  boardScreenRatio = Math.min(1, widthRatio, heightRatio)
}

const setCssConst = (): void => {
  root.style.setProperty('--d-board-ratio', `${boardScreenRatio}`)
  root.style.setProperty('--d-ball-diameter', `${ballDiameter * boardScreenRatio}px`)
  root.style.setProperty('--d-board-width', `${boardWidth * boardScreenRatio}px`)
  root.style.setProperty('--d-board-height', `${boardHeight * boardScreenRatio}px`)
  root.style.setProperty('--d-board-padding', `${boardPadding * boardScreenRatio}px`)
  root.style.setProperty('--d-paddle-height', `${paddleHeight * boardScreenRatio}px`)
  root.style.setProperty('--d-paddle-width', `${paddleWidth * boardScreenRatio}px`)
}

export const translateCoordinates = (x: number, y: number) =>
  `translate(calc(${x}px * var(--d-board-ratio)), calc(${y}px * var(--d-board-ratio)))`

export const useSetCssConst = () => {
  useEffect(() => {
    const update = () => {
      calcBoardScreenRatio()
      setCssConst()
    }

    update()

    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
    }
  }, [])
}
