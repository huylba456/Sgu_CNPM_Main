import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { RestaurantProvider } from './context/RestaurantContext.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <RestaurantProvider>
        <AuthProvider>
          <DataProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </DataProvider>
        </AuthProvider>
      </RestaurantProvider>
    </BrowserRouter>
  </React.StrictMode>
);
