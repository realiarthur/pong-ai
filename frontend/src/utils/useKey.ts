import { useEffect } from 'react'

export const useKey = (
  keyCode: string | undefined,
  callback: () => void,
  preventDefault = false,
) => {
  useEffect(() => {
    if (!keyCode) return
    const handle = (e: KeyboardEvent) => {
      if (e.code === keyCode) {
        if (preventDefault) {
          e.preventDefault()
        }
        callback()
      }
    }

    window.addEventListener('keydown', handle)

    return () => {
      window.removeEventListener('keydown', handle)
    }
  }, [keyCode, callback])
}
