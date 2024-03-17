import { useEffect } from 'react'

let wakeLock: WakeLockSentinel | null = null
const releaseWakeLock = () => {
  wakeLock?.release().then(() => {
    wakeLock = null
  })
}

const useWakeLock = (use: boolean) => {
  useEffect(() => {
    if (!use) {
      releaseWakeLock()
      return
    }

    if ('wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .catch()
        .then(lock => {
          wakeLock = lock
        })
    }

    return () => {
      releaseWakeLock()
    }
  }, [use])
}

export default useWakeLock
