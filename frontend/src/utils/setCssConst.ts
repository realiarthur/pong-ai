import { getConfig } from 'classes'

const { ballDiameter, boardWidth, boardHeight, boardPadding, paddleHeight, paddleWidth } =
  getConfig()

export const setCssConst = (): void => {
  const root = document.documentElement

  root.style.setProperty('--d-ball-diameter', `${ballDiameter}px`)
  root.style.setProperty('--d-board-width', `${boardWidth}px`)
  root.style.setProperty('--d-board-height', `${boardHeight}px`)
  root.style.setProperty('--d-board-padding', `${boardPadding}px`)
  root.style.setProperty('--d-paddle-height', `${paddleHeight}px`)
  root.style.setProperty('--d-paddle-width', `${paddleWidth}px`)
}
