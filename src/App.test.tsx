import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './lib/auth';
import { FavoritesProvider } from './lib/favoritesContext';

test('renders without crashing', () => {
  const { baseElement } = render(
    <AuthProvider>
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </AuthProvider>
  );
  expect(baseElement).toBeDefined();
});
