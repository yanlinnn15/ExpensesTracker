// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from './helpers/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Suspense>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Suspense>
  </ErrorBoundary>,
)
