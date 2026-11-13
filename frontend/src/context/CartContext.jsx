import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_PRODUCTS } from '../data/demoProducts';
import { INITIAL_DEMO_ORDERS } from '../data/demoOrders';
const CartContext = createContext(undefined);
export const CartProvider = ({ children }) => {
    // Default selected product to Lenovo IdeaPad for immediate hackathon inspection
    const [selectedProduct, setSelectedProduct] = useState(() => DEMO_PRODUCTS[0]);
    // Default comparison list to top 2 products
    const [comparisonList, setComparisonList] = useState(() => [
        DEMO_PRODUCTS[0],
        DEMO_PRODUCTS[1],
        DEMO_PRODUCTS[2],
    ]);
    const [userApprovalConfirmed, setUserApprovalConfirmed] = useState(() => {
        try {
            return sessionStorage.getItem('finsight_user_approval') === 'true';
        }
        catch {
            return false;
        }
    });
    const [acknowledgedWarnings, setAcknowledgedWarnings] = useState(() => {
        try {
            const stored = sessionStorage.getItem('finsight_ack_warnings');
            return stored ? JSON.parse(stored) : [];
        }
        catch {
            return [];
        }
    });
    useEffect(() => {
        try {
            sessionStorage.setItem('finsight_user_approval', userApprovalConfirmed ? 'true' : 'false');
        }
        catch { }
    }, [userApprovalConfirmed]);
    useEffect(() => {
        try {
            sessionStorage.setItem('finsight_ack_warnings', JSON.stringify(acknowledgedWarnings));
        }
        catch { }
    }, [acknowledgedWarnings]);
    const [orders, setOrders] = useState(() => INITIAL_DEMO_ORDERS);
    const selectProductForReview = (product) => {
        setSelectedProduct(product);
        setUserApprovalConfirmed(false);
        setAcknowledgedWarnings([]);
        try {
            sessionStorage.removeItem('finsight_user_approval');
            sessionStorage.removeItem('finsight_ack_warnings');
        }
        catch { }
    };
    const toggleComparison = (product) => {
        setComparisonList((prev) => {
            const exists = prev.some((p) => p.id === product.id);
            if (exists) {
                return prev.filter((p) => p.id !== product.id);
            }
            else {
                if (prev.length >= 4) {
                    alert('You can compare a maximum of 4 products simultaneously.');
                    return prev;
                }
                return [...prev, product];
            }
        });
    };
    const removeFromComparison = (productId) => {
        setComparisonList((prev) => prev.filter((p) => p.id !== productId));
    };
    const clearComparison = () => {
        setComparisonList([]);
    };
    const isInComparison = (productId) => {
        return comparisonList.some((p) => p.id === productId);
    };
    const toggleWarningAcknowledgment = (warning) => {
        setAcknowledgedWarnings((prev) => prev.includes(warning) ? prev.filter((w) => w !== warning) : [...prev, warning]);
    };
    const addOrder = (order) => {
        setOrders((prev) => [order, ...prev]);
    };
    const updateOrderStatus = (orderId, status) => {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    };
    return (<CartContext.Provider value={{
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
        }}>
      {children}
    </CartContext.Provider>);
};
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
