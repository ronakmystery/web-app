// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

console.log("register service worker");

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register("/sw2.js", {
      updateViaCache: "none"
    });
    console.log("✅ Service Worker Registered!", registration);

    // Force update check
    registration.update();

    // Detect new version and prompt reload
    registration.onupdatefound = () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.onstatechange = () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          // New update is ready
          console.log("🆕 New content available");
          if (confirm("A new version is available. Reload now?")) {
            window.location.reload();
          }
        }
      };
    };
  } catch (err) {
    console.error("❌ Service Worker registration failed", err);
  }
}

registerServiceWorker();


ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
