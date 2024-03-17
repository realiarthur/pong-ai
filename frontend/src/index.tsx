import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App/App'
import { init, track } from './core/amplitude'
import './index.css'

init()
track('OPEN')

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
