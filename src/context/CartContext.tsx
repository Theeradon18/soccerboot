import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { api } from '../services/api';
import { CartItem, Product } from '../types/Product';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shipping: number;
  total: number;
  badgeScale: Animated.Value;
  addToCart: (product: Product, size: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const SHIPPING_FEE = 50;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const badgeScale = useRef(new Animated.Value(1)).current;

  const storageKey = `@football_boots_cart_${user?.id || 'guest'}`;

  // Load cart when user changes
  useEffect(() => {
    loadUserCart();
  }, [user?.id]);

  const loadUserCart = async () => {
    try {
      if (user?.id) {
        // Try to fetch backend cart first
        const backendItems = await api.getCart(user.id);
        if (backendItems && backendItems.length > 0) {
          setItems(backendItems);
          await AsyncStorage.setItem(storageKey, JSON.stringify(backendItems));
          return;
        }
      }

      // Fallback to local storage
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      setItems([]);
    }
  };

  const persistCart = async (newItems: CartItem[]) => {
    setItems(newItems);
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(newItems));
      if (user?.id) {
        api.saveCart(user.id, newItems).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to persist cart:', err);
    }
  };

  const triggerBadgeAnimation = () => {
    Animated.sequence([
      Animated.timing(badgeScale, {
        toValue: 1.25,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(badgeScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const addToCart = async (
    product: Product,
    size: string,
    quantity = 1
  ): Promise<boolean> => {
    if (product.stock <= 0) return false;

    const existingIndex = items.findIndex(
      (item) => String(item.productId) === String(product.id) && item.size === size
    );

    let newItems: CartItem[];
    if (existingIndex !== -1) {
      const currentQty = items[existingIndex].quantity;
      const targetQty = Math.min(currentQty + quantity, product.stock);
      newItems = [...items];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: targetQty,
        stock: product.stock,
      };
    } else {
      const newItem: CartItem = {
        id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        productId: product.id,
        name: product.name,
        brand: product.brand,
        model: product.model,
        size,
        price: Number(product.price),
        quantity: Math.min(quantity, product.stock),
        image_url: product.image_url,
        stock: product.stock,
      };
      newItems = [...items, newItem];
    }

    await persistCart(newItems);
    triggerBadgeAnimation();
    return true;
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    const updated = items
      .map((item) => {
        if (item.id === cartItemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.stock) return item; // Don't exceed stock
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    persistCart(updated);
  };

  const removeFromCart = (cartItemId: string) => {
    const updated = items.filter((item) => item.id !== cartItemId);
    persistCart(updated);
  };

  const clearCart = () => {
    persistCart([]);
    if (user?.id) {
      api.clearCart(user.id).catch(() => {});
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = items.length > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        shipping,
        total,
        badgeScale,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
