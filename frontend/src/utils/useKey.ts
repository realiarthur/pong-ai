import { useEffect } from 'react'

export const useKey = (
  keyCode: string,
  callback: () => void,
  deps = [],
  preventDefault = false,
) => {
  useEffect(() => {
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
  }, [keyCode, ...deps])
}
