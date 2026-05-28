import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/index.css'

console.log('=== React App Starting ===')

try {
  const root = document.getElementById('root')
  console.log('Root element:', root)
  
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('=== React App Rendered ===')
} catch (error) {
  console.error('=== React App Error ===', error)
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; color: red;">
      <h2>Ошибка загрузки приложения</h2>
      <pre>${error.message}</pre>
    </div>
  `
}
