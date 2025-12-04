import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Overview from './pages/Overview'
import BackendStatus from './components/BackendStatus'

function App(){
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">CodeSenseX</h1>
      <BackendStatus />
      <Overview />
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
