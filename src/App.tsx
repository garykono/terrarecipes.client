import { useState, useContext, useEffect } from 'react'
import { RouterProvider, useNavigate } from 'react-router-dom'

import { appRouter } from './routes/appRouter'
import ErrorBoundary from './components/ErrorBoundary'



function App() {
    return (
        <ErrorBoundary fallback={<div>got to error boundary</div>}>
            <RouterProvider router={appRouter} />
        </ErrorBoundary>
    )
}

export default App;
