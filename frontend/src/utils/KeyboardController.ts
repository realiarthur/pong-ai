export class KeyboardController {
  upPressed = 0
  downPressed = 0

  constructor() {
    window.addEventListener('keydown', this.press)
    window.addEventListener('keyup', this.cancel)
  }

  destroy = () => {
    window.removeEventListener('keydown', this.press)
    window.removeEventListener('keyup', this.cancel)
  }

  press = ({ code }: KeyboardEvent) => {
    if (code === 'ArrowUp' || code === 'KeyW') {
      this.upPressed = 1
    }
    if (code === 'ArrowDown' || code === 'KeyS') {
      this.downPressed = 1
    }
  }

  cancel = ({ code }: KeyboardEvent) => {
    if (code === 'ArrowUp' || code === 'KeyW') {
      this.upPressed = 0
    }
    if (code === 'ArrowDown' || code === 'KeyS') {
      this.downPressed = 0
    }
  }

  getDirection = () => {
    return this.downPressed - this.upPressed
  }
}
