import { DEMO_PRODUCTS } from '../data/demoProducts';
import { INITIAL_MULTI_AGENT_STATE } from '../data/demoAgents';
import { INITIAL_DEMO_ORDERS } from '../data/demoOrders';
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
export const IS_MOCK_FALLBACK_ENABLED = import.meta.env.VITE_ENABLE_MOCK_FALLBACK !== 'false';
// Helper to determine if backend is reachable
let isBackendAlive = null;
export async function checkBackendHealth() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
            isBackendAlive = false;
            return { alive: false, url: API_BASE_URL };
        }
        const data = await res.json();
        isBackendAlive = true;
        return {
            alive: true,
            url: API_BASE_URL,
            groqConfigured: Boolean(data.groqConfigured),
            razorpayConfigured: Boolean(data.razorpayConfigured),
            paymentMode: data.paymentMode || 'test',
        };
    }
    catch (err) {
        isBackendAlive = false;
        return { alive: false, url: API_BASE_URL };
    }
}
/**
 * 1. GET /api/products
 * Fetches all products (or returns demo products if backend is offline)
 */
export async function getProducts() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { products: data.products || data, isFromBackend: true };
    }
    catch (error) {
        if (IS_MOCK_FALLBACK_ENABLED) {
            // Return typed demo products
            return { products: DEMO_PRODUCTS, isFromBackend: false };
        }
        throw error;
    }
}
/**
 * 2. POST /api/search
 * Natural language product search with budget & category constraints
 */
export async function searchProducts(payload) {
    try {
        const sanitizedPayload = {
            ...payload,
            query: payload.query?.trim() ? payload.query.trim() : 'all',
        };
        const res = await fetch(`${API_BASE_URL}/api/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sanitizedPayload),
        });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return {
            products: data.products || [],
            isFromBackend: true,
            queryInterpretation: data.queryInterpretation,
        };
    }
    catch (error) {
        if (IS_MOCK_FALLBACK_ENABLED) {
            // Client-side smart filter simulation on demo products
            const queryLower = (payload.query || '').toLowerCase();
            let filtered = [...DEMO_PRODUCTS];
            if (payload.category && payload.category !== 'All Categories') {
                filtered = filtered.filter((p) => p.category.toLowerCase() === payload.category.toLowerCase());
            }
            if (payload.maxBudget && payload.maxBudget > 0) {
                filtered = filtered.filter((p) => p.price <= payload.maxBudget);
            }
            if (payload.onlyVerified) {
                filtered = filtered.filter((p) => p.verificationStatus === 'VERIFIED');
            }
            if (queryLower.trim()) {
                filtered = filtered.filter((p) => {
                    const matchTitle = p.title.toLowerCase().includes(queryLower);
                    const matchBrand = p.brand.toLowerCase().includes(queryLower);
                    const matchSpecs = Object.values(p.specs).some((v) => typeof v === 'string' && v.toLowerCase().includes(queryLower));
                    const matchQueryKeywords = ['laptop', 'machine learning', '16gb', 'ram'].every((k) => queryLower.includes(k) ? (p.title.toLowerCase().includes(k) || JSON.stringify(p.specs).toLowerCase().includes(k)) : true);
                    return matchTitle || matchBrand || matchSpecs || matchQueryKeywords;
                });
            }
            return {
                products: filtered,
                isFromBackend: false,
                queryInterpretation: `Filtered demo catalog for: "${payload.query || 'All'}" under budget ₹${payload.maxBudget || 'Uncapped'}`,
            };
        }
        throw error;
    }
}
/**
 * 2b. POST /api/compare
 * Compares selected product IDs side-by-side
 */
export async function compareProducts(productIds) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/compare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds }),
        });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return {
            products: data.products,
            matrix: data.matrix,
            suitabilityRanking: data.suitabilityRanking,
            isFromBackend: true,
        };
    }
    catch (error) {
        if (IS_MOCK_FALLBACK_ENABLED) {
            return {
                matrix: { featuresCompared: ['Processor', 'RAM', 'GPU', 'Storage', 'Seller'] },
                suitabilityRanking: [],
                isFromBackend: false,
            };
        }
        throw error;
    }
}
/**
 * 3. POST /api/agent/run
 * Initiates multi-agent orchestration for a search or product verification
 */
export async function runAgentAnalysis(payload) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/agent/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return {
            runId: data.run_id,
            state: data.state || INITIAL_MULTI_AGENT_STATE,
            isFromBackend: true,
        };
    }
    catch (error) {
        if (IS_MOCK_FALLBACK_ENABLED) {
            const generatedRunId = `demo-run-${Date.now()}`;
            return {
                runId: generatedRunId,
                state: {
                    ...INITIAL_MULTI_AGENT_STATE,
                    runId: generatedRunId,
                    currentQuery: payload.query,
                    startTime: new Date().toISOString(),
                    isSimulatedDemo: true,
                },
                isFromBackend: false,
            };
        }
        throw error;
    }
}
/**
 * 4. GET /api/agent/{run_id}
 * Polls or streams current agent run status and logs
 */
export async function getAgentRunStatus(runId) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/agent/${runId}`);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { run: data, isFromBackend: true };
    }
    catch (error) {
        if (IS_MOCK_FALLBACK_ENABLED) {
            return {
                run: {
                    run_id: runId,
                    query: INITIAL_MULTI_AGENT_STATE.currentQuery,
                    status: 'completed',
                    created_at: INITIAL_MULTI_AGENT_STATE.startTime || new Date().toISOString(),
                    agents: {
                        research: {
                            status: INITIAL_MULTI_AGENT_STATE.agents.research.status,
                            progress: 100,
                            metrics: INITIAL_MULTI_AGENT_STATE.agents.research.metrics,
                            logs: INITIAL_MULTI_AGENT_STATE.agents.research.logs,
                        },
                        comparison: {
                            status: INITIAL_MULTI_AGENT_STATE.agents.comparison.status,
                            progress: 100,
                            metrics: INITIAL_MULTI_AGENT_STATE.agents.comparison.metrics,
                            logs: INITIAL_MULTI_AGENT_STATE.agents.comparison.logs,
                        },
                        verification: {
                            status: INITIAL_MULTI_AGENT_STATE.agents.verification.status,
                            progress: 100,
                            metrics: INITIAL_MULTI_AGENT_STATE.agents.verification.metrics,
                            logs: INITIAL_MULTI_AGENT_STATE.agents.verification.logs,
                        },
                        budget: {
                            status: INITIAL_MULTI_AGENT_STATE.agents.budget.status,
                            progress: 100,
                            metrics: INITIAL_MULTI_AGENT_STATE.agents.budget.metrics,
                            logs: INITIAL_MULTI_AGENT_STATE.agents.budget.logs,
                        },
                        recommendation: {
                            status: INITIAL_MULTI_AGENT_STATE.agents.recommendation?.status || 'completed',
                            progress: 100,
                            metrics: INITIAL_MULTI_AGENT_STATE.agents.recommendation?.metrics || { synthesizedConsensus: 94 },
                            logs: INITIAL_MULTI_AGENT_STATE.agents.recommendation?.logs || [],
                        },
                    },
                    summary: INITIAL_MULTI_AGENT_STATE.summary,
                },
                isFromBackend: false,
            };
        }
        throw error;
    }
}
/**
 * 5a. GET /api/checkout/config
 * Retrieves PayPal Sandbox public configuration
 */
export async function getCheckoutConfig() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/checkout/config`);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return {
            clientId: data.clientId || '',
            configured: Boolean(data.configured),
            currency: data.currency || 'USD',
            environment: data.environment || 'sandbox',
            isFromBackend: true,
            razorpayConfigured: Boolean(data.razorpayConfigured),
        };
    }
    catch (error) {
        const localId = import.meta.env.VITE_PAYPAL_SANDBOX_CLIENT_ID || '';
        const hasLocal = Boolean(localId && !localId.startsWith('sb-demo-') && !localId.startsWith('your-'));
        return {
            clientId: localId,
            configured: hasLocal,
            currency: 'USD',
            environment: 'sandbox',
            isFromBackend: false,
        };
    }
}
/**
 * 5. POST /api/checkout/create-order
 * Creates PayPal Sandbox Order on the FastAPI backend
 */
export async function createCheckoutOrder(payload) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/checkout/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            let errorDetail = `Server returned HTTP ${res.status}`;
            try {
                const errJson = await res.json();
                if (errJson.detail)
                    errorDetail = errJson.detail;
            }
            catch {
                // use fallback status
            }
            throw new Error(errorDetail);
        }
        const data = await res.json();
        return {
            orderId: data.orderId || data.order_id,
            paypalOrderId: data.paypalOrderId || data.paypal_order_id,
            isFromBackend: true,
        };
    }
    catch (error) {
        throw error;
    }
}
/**
 * 6. POST /api/checkout/capture-order
 * Captures an approved PayPal Sandbox Order
 */
export async function captureCheckoutOrder(payload) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/checkout/capture-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            let errorDetail = `Server returned HTTP ${res.status}`;
            try {
                const errJson = await res.json();
                if (errJson.detail)
                    errorDetail = errJson.detail;
            }
            catch {
                // use fallback status
            }
            throw new Error(errorDetail);
        }
        const data = await res.json();
        return {
            status: data.status,
            order: data.order,
            isFromBackend: true,
        };
    }
    catch (error) {
        throw error;
    }
}
/**
 * 7. GET /api/orders
 * Retrieves verified order history
 */
export async function getOrders() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/orders`);
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { orders: data.orders || data, isFromBackend: true };
    }
    catch (error) {
        if (IS_MOCK_FALLBACK_ENABLED) {
            return { orders: INITIAL_DEMO_ORDERS, isFromBackend: false };
        }
        throw error;
    }
}
/**
 * 8. POST /api/payments/create-order
 * Creates a server-side order on Razorpay with server-side price authority
 */
export async function createRazorpayPaymentOrder(payload) {
    const res = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
            const err = await res.json();
            if (err.detail)
                detail = err.detail;
        }
        catch { }
        throw new Error(detail);
    }
    return await res.json();
}
/**
  const res = await fetch(`${API_BASE_URL}/api/payments/demo-checkout`, {
 * Evaluator demo checkout pass that persists real OrderRecord and notification outbox on backend
 */
export async function createDemoPaymentOrder(payload) {
    const res = await fetch(`${API_BASE_URL}/api/payments/demo-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
            const err = await res.json();
            if (err.detail)
                detail = err.detail;
        }
        catch { }
        throw new Error(detail);
    }
    const data = await res.json();
    return {
        id: data.id,
        productId: data.productId,
        productTitle: data.productTitle,
        productCategory: data.productCategory,
        productImageUrl: data.productImageUrl,
        sellerName: data.sellerName,
        sellerVerified: data.sellerVerified,
        amount: data.amount,
        shippingFee: data.shippingFee,
        taxFee: data.taxFee,
        totalAmount: data.totalAmount,
        currency: data.currency,
        status: data.status || 'captured',
        orderStatus: data.orderStatus,
        paymentStatus: data.paymentStatus,
        paymentGateway: data.paymentGateway,
        razorpayOrderId: data.razorpayOrderId,
        razorpayPaymentId: data.razorpayPaymentId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        whatsappOptIn: data.whatsappOptIn,
        date: data.createdAt,
        isDemo: true,
    };
}
/**
 * 9. POST /api/payments/verify
 * Authoritatively verifies Razorpay signature and status on backend
 */
export async function verifyRazorpayPayment(payload) {
    const res = await fetch(`${API_BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
            const err = await res.json();
            if (err.detail)
                detail = err.detail;
        }
        catch { }
        throw new Error(detail);
    }
    return await res.json();
}
/**
 * 10. GET /api/orders/{order_id}
 * Retrieves live order tracking details
 */
export async function getOrderDetail(orderId, token) {
    const headers = {};
    if (token)
        headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, { headers });
    if (!res.ok)
        throw new Error(`HTTP ${res.status}`);
    return await res.json();
}
/**
 * 11. POST /api/orders/{order_id}/status
 * Administrative shipment status update
 */
export async function updateOrderStatusAdmin(orderId, payload, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token)
        headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
            const err = await res.json();
            if (err.detail)
                detail = err.detail;
        }
        catch { }
        throw new Error(detail);
    }
    return await res.json();
}
/**
 * 12. Authentication Endpoints
 */
export async function registerUser(payload) {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
            const err = await res.json();
            if (err.detail)
                detail = err.detail;
        }
        catch { }
        throw new Error(detail);
    }
    return await res.json();
}
export async function loginUser(payload) {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
            const err = await res.json();
            if (err.detail)
                detail = err.detail;
        }
        catch { }
        throw new Error(detail);
    }
    return await res.json();
}
export async function requestOTP(payload) {
    const res = await fetch(`${API_BASE_URL}/api/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
            const err = await res.json();
            if (err.detail)
                detail = err.detail;
        }
        catch { }
        throw new Error(detail);
    }
    return await res.json();
}
export async function verifyOTP(payload) {
    const res = await fetch(`${API_BASE_URL}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
            const err = await res.json();
            if (err.detail)
                detail = err.detail;
        }
        catch { }
        throw new Error(detail);
    }
    return await res.json();
}
export async function getMyProfile(token) {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok)
        throw new Error(`HTTP ${res.status}`);
    return await res.json();
}
