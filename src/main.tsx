import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/css/global.css'
import './assets/css/global_queries.css'
import App from './App.js'
import ErrorBoundary from './components/ErrorBoundary'
// import 'bulma/css/bulma.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary fallback={<div>got to error boundary</div>}>
            <App />
        </ErrorBoundary>
    </StrictMode>
)
