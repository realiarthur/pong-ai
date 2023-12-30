import { config } from 'classes'

export const setCssConst = (): void => {
  const root = document.documentElement

  root.style.setProperty('--d-ball-radius', `${config.ballRadius}px`)
  root.style.setProperty('--d-board-width', `${config.boardWidth}px`)
  root.style.setProperty('--d-board-height', `${config.boardHeight}px`)
  root.style.setProperty('--d-board-padding', `${config.boardPadding}px`)
  root.style.setProperty('--d-paddle-height', `${config.paddleHeight}px`)
  root.style.setProperty('--d-paddle-height', `${config.paddleHeight}px`)
  root.style.setProperty('--d-paddle-width', `${config.paddleWidth}px`)
}
