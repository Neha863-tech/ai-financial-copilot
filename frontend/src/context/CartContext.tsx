import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/product';
import { Order } from '../types/order';
import { DEMO_PRODUCTS } from '../data/demoProducts';
import { INITIAL_DEMO_ORDERS } from '../data/demoOrders';

interface CartContextType {
  selectedProduct: Product | null;
  comparisonList: Product[];
  userApprovalConfirmed: boolean;
  acknowledgedWarnings: string[];
  orders: Order[];
  selectProductForReview: (product: Product) => void;
  toggleComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
  toggleWarningAcknowledgment: (warning: string) => void;
  setUserApprovalConfirmed: (confirmed: boolean) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default selected product to Lenovo IdeaPad for immediate hackathon inspection
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => DEMO_PRODUCTS[0]);
  
  // Default comparison list to top 2 products
  const [comparisonList, setComparisonList] = useState<Product[]>(() => [
    DEMO_PRODUCTS[0],
    DEMO_PRODUCTS[1],
    DEMO_PRODUCTS[2],
  ]);

  const [userApprovalConfirmed, setUserApprovalConfirmed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('trustcart_user_approval') === 'true';
    } catch {
      return false;
    }
  });

  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem('trustcart_ack_warnings');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('trustcart_user_approval', userApprovalConfirmed ? 'true' : 'false');
    } catch {}
  }, [userApprovalConfirmed]);

  useEffect(() => {
    try {
      sessionStorage.setItem('trustcart_ack_warnings', JSON.stringify(acknowledgedWarnings));
    } catch {}
  }, [acknowledgedWarnings]);

  const [orders, setOrders] = useState<Order[]>(() => INITIAL_DEMO_ORDERS);

  const selectProductForReview = (product: Product) => {
    setSelectedProduct(product);
    setUserApprovalConfirmed(false);
    setAcknowledgedWarnings([]);
    try {
      sessionStorage.removeItem('trustcart_user_approval');
      sessionStorage.removeItem('trustcart_ack_warnings');
    } catch {}
  };

  const toggleComparison = (product: Product) => {
    setComparisonList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        if (prev.length >= 4) {
          alert('You can compare a maximum of 4 products simultaneously.');
          return prev;
        }
        return [...prev, product];
      }
    });
  };

  const removeFromComparison = (productId: string) => {
    setComparisonList((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const isInComparison = (productId: string) => {
    return comparisonList.some((p) => p.id === productId);
  };

  const toggleWarningAcknowledgment = (warning: string) => {
    setAcknowledgedWarnings((prev) =>
      prev.includes(warning) ? prev.filter((w) => w !== warning) : [...prev, warning]
    );
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  return (
    <CartContext.Provider
      value={{
        selectedProduct,
        comparisonList,
        userApprovalConfirmed,
        acknowledgedWarnings,
        orders,
        selectProductForReview,
        toggleComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
        toggleWarningAcknowledgment,
        setUserApprovalConfirmed,
        addOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
