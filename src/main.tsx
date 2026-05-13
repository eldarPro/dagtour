import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './lib/auth';
import { FavoritesProvider } from './lib/favoritesContext';

const SPLASH_MIN_MS = 2000;

const container = document.getElementById('root');
const root = createRoot(container!);

const minDelay = new Promise<void>(resolve => setTimeout(resolve, SPLASH_MIN_MS));
const appReady = new Promise<void>(resolve => {
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </AuthProvider>
    </React.StrictMode>
  );
  resolve();
});

const splash = document.getElementById('splash');
Promise.all([minDelay, appReady]).then(() => {
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(() => splash.remove(), 300);
  }
});