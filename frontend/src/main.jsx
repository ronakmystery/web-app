// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      updateViaCache: "none",
    });

    // 🔄 Force check for new version
    registration.update();

    // 📦 Handle update found
    registration.onupdatefound = () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.onstatechange = () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          // 🚨 Update is ready, ask user to reload
          if (confirm("🔄 A new version is available. Reload now?")) {
            window.location.reload();
          }
        }
      };
    };
  } catch (err) {
    console.error("❌ Service Worker registration failed:", err);
  }
}
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
