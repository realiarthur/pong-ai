import * as amplitude from '@amplitude/analytics-browser'

export const init = () => {
  amplitude.init('699dd5470c7f42c25678fdb242b51980', {
    defaultTracking: false,
  })
}

const isDev = window.location.origin.includes('localhost')

export const track = (event: string, data?: Record<string, unknown>) => {
  if (!isDev) {
    amplitude.track(`PONG_AI ${event}`, data)
  }
}
