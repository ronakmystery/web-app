// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

async function registerServiceWorker() {
  try {
    let registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker Registered!", registration);
  } catch (err) {
    console.error("Service Worker Registration Failed", err);
  }
}

registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
