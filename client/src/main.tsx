import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
//import './styles/main.scss'

// Start the application without MSW
console.log('🚀 Starting application with real API...');
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
