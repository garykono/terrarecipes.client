import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.js'
import 'bulma/css/bulma.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)
