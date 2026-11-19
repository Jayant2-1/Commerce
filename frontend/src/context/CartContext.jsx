import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { cartApi } from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const applyCart = useCallback((data) => {
    setCart(data);
    setCartCount(data?.totalItems || 0);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      setCartCount(0);
      return null;
    }

    setLoading(true);
    try {
      const res = await cartApi.getCart();
      const data = res.data.data;
      applyCart(data);
      return data;
    } catch {
      setCart(null);
      setCartCount(0);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, applyCart]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, refreshCart, applyCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
