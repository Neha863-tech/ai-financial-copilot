import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Eye,
  X,
  Store,
  Calendar,
  Lock,
  ArrowRight,
  Truck,
  Package,
  MessageSquare,
  Smartphone,
  ChevronRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Order, LifecycleOrderStatus } from '../types/order';
import { getOrders, updateOrderStatusAdmin } from '../services/api';

const ORDER_STEPS: { key: LifecycleOrderStatus; label: string; desc: string }[] = [
  { key: 'PAID', label: 'Payment Confirmed', desc: 'Verified through Razorpay' },
  { key: 'PROCESSING', label: 'Processing Order', desc: 'Seller preparing package' },
  { key: 'SHIPPED', label: 'Shipped', desc: 'Dispatched with carrier' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Courier out for delivery' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Package delivered to buyer' },
];

export const OrderHistoryPage: React.FC = () => {
  const { orders: cartOrders } = useCart();
  const { token, user } = useAuth();

  const [ordersList, setOrdersList] = useState<Order[]>(cartOrders);
  const [selectedOrderForAudit, setSelectedOrderForAudit] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Sync orders from backend
  const fetchBackendOrders = async () => {
    try {
      const res = await getOrders();
      if (res.orders) {
        // Merge backend orders with local cart state without duplicating
        const merged = [...res.orders];
        for (const co of cartOrders) {
          if (!merged.some((b) => b.id === co.id)) {
            merged.push(co);
          }
        }
        setOrdersList(merged);
        if (selectedOrderForAudit) {
          const updated = merged.find((o) => o.id === selectedOrderForAudit.id);
          if (updated) setSelectedOrderForAudit(updated);
        }
      }
    } catch {
      // keep local cart fallback
    }
  };

  useEffect(() => {
    fetchBackendOrders();
  }, []);

  const filteredOrders = ordersList.filter((o) => {
    if (statusFilter === 'all') return true;
    return (
      o.status.toLowerCase() === statusFilter.toLowerCase() ||
      (o.orderStatus && o.orderStatus.toLowerCase() === statusFilter.toLowerCase())
    );
  });

  const getStepIndex = (status?: string): number => {
    if (!status) return 0;
    const normalized = status.toUpperCase();
    if (normalized === 'PAID') return 0;
    if (normalized === 'PROCESSING') return 1;
    if (normalized === 'SHIPPED') return 2;
    if (normalized === 'OUT_FOR_DELIVERY') return 3;
    if (normalized === 'DELIVERED') return 4;
    return 0;
  };

  // Admin status transition simulator
  const handleAdvanceStatus = async (orderId: string, nextStatus: string) => {
    setIsUpdatingStatus(true);
    setActionSuccessMsg(null);
    try {
      const updated = await updateOrderStatusAdmin(
        orderId,
        {
          status: nextStatus,
          carrier: nextStatus === 'SHIPPED' ? 'BlueDart Express' : undefined,
          trackingNumber: nextStatus === 'SHIPPED' ? `BD-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
        },
        token || undefined
      );
      setActionSuccessMsg(`Order transitioned to ${nextStatus}. Customer notifications dispatched!`);
      setSelectedOrderForAudit(updated);
      await fetchBackendOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string, lifecycleStatus?: string) => {
    const effective = (lifecycleStatus || status).toUpperCase();

    switch (effective) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Delivered</span>
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/80 animate-pulse">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Out for Delivery</span>
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/80">
            <Package className="w-3.5 h-3.5 text-indigo-400" />
            <span>Shipped (In Transit)</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-950/80 text-violet-300 border border-violet-800/80">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            <span>Processing</span>
          </span>
        );
      case 'PAID':
      case 'CAPTURED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paid (Captured)</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-navy-950 text-slate-400 border border-navy-800">
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/80">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Payment</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-16 text-slate-100">
      {/* Header */}
      <div className="bg-navy-900/80 backdrop-blur-md rounded-3xl border border-navy-800 p-6 sm:p-8 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-violet-950/80 border border-violet-800/80 text-violet-400">
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Verified Order Audit & Live Tracking
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Every transaction is preserved with its pre-checkout evidence snapshot, payment receipt, and SMS/WhatsApp notifications.
          </p>
        </div>

        {/* Status Filter & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBackendOrders}
            className="p-2 bg-navy-950 hover:bg-navy-850 border border-navy-800 text-slate-300 hover:text-white rounded-xl transition-colors"
            title="Refresh order history"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium text-slate-200 bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Orders ({ordersList.length})</option>
            <option value="PAID">Paid / Captured</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-navy-900/80 backdrop-blur-md rounded-3xl border border-navy-800 shadow-card overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="font-bold text-slate-300 text-sm">No Orders Found</h4>
            <p className="text-xs text-slate-500">
              Complete a verified checkout to record your first audit-verified order.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-navy-950/80 border-b border-navy-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Order ID & Date</th>
                  <th className="py-3.5 px-6">Product Details</th>
                  <th className="py-3.5 px-6">Amount & Gateway</th>
                  <th className="py-3.5 px-6">Tracking Status</th>
                  <th className="py-3.5 px-6">Notifications</th>
                  <th className="py-3.5 px-6 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/80 font-medium">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-navy-800/40 transition-colors">
                    {/* Order ID & Date */}
                    <td className="py-4 px-6 space-y-1">
                      <div className="font-mono font-bold text-slate-100">{order.id}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{new Date(order.date || order.createdAt || '').toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Product Details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.productImageUrl}
                          alt={order.productTitle}
                          className="w-11 h-11 object-cover rounded-lg border border-navy-800 flex-shrink-0 bg-navy-950"
                        />
                        <div className="min-w-0 max-w-xs space-y-0.5">
                          <div className="font-bold text-slate-100 truncate">
                            {order.productTitle}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Store className="w-3.5 h-3.5 text-slate-500" />
                            <span>{order.sellerName}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Amount & Gateway */}
                    <td className="py-4 px-6 space-y-1">
                      <div className="font-mono font-bold text-slate-100 text-sm">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <span className="uppercase text-violet-400 font-semibold">
                          {order.paymentGateway === 'razorpay' ? 'Razorpay' : 'PayPal'}
                        </span>
                        {order.razorpayPaymentId && (
                          <span className="truncate max-w-[90px]">#{order.razorpayPaymentId.slice(-6)}</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {getStatusBadge(order.status, order.orderStatus)}
                    </td>

                    {/* Notifications Channels */}
                    <td className="py-4 px-6 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[11px] text-slate-300 bg-navy-950 px-2 py-0.5 rounded border border-navy-800">
                          <Smartphone className="w-3 h-3 text-slate-400" /> SMS
                        </span>
                        {order.whatsappOptIn && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded font-semibold">
                            <MessageSquare className="w-3 h-3 text-emerald-400" /> WhatsApp
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrderForAudit(order)}
                        className="px-3 py-1.5 rounded-xl border border-navy-800 hover:border-violet-500/50 bg-navy-950 hover:bg-navy-850 text-violet-400 font-semibold text-xs transition-colors inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Track & Audit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Modal: Order Tracking & Pre-Checkout Evidence */}
      {selectedOrderForAudit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-navy-900 rounded-3xl shadow-2xl border border-navy-800 overflow-hidden max-h-[90vh] flex flex-col text-slate-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 text-white p-6 relative flex-shrink-0 border-b border-navy-800">
              <button
                onClick={() => {
                  setSelectedOrderForAudit(null);
                  setActionSuccessMsg(null);
                }}
                className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-violet-600/30 text-violet-300 border border-violet-500/30">
                  <Truck className="w-6 h-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">Order Tracking & Evidence Audit</h3>
                    {getStatusBadge(selectedOrderForAudit.status, selectedOrderForAudit.orderStatus)}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Order Ref: {selectedOrderForAudit.id} • {selectedOrderForAudit.paymentGateway.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-7 space-y-6 overflow-y-auto custom-scrollbar">
              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* Order Tracking Progress Stepper */}
              <div className="p-5 bg-navy-950/80 rounded-2xl border border-navy-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Live Fulfillment Stepper
                </h4>

                <div className="grid grid-cols-5 gap-2 text-center relative">
                  {ORDER_STEPS.map((step, idx) => {
                    const currentIdx = getStepIndex(selectedOrderForAudit.orderStatus);
                    const isDone = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={step.key} className="space-y-1.5 flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                            isDone
                              ? 'bg-violet-600 text-white shadow-glow'
                              : 'bg-navy-900 border border-navy-800 text-slate-500'
                          } ${isCurrent ? 'ring-4 ring-violet-500/30 animate-pulse' : ''}`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div className="text-[11px] font-bold text-slate-200 leading-tight">
                          {step.label}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight hidden sm:block">
                          {step.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Carrier info if shipped */}
                {selectedOrderForAudit.trackingCarrier && (
                  <div className="mt-3 p-3 bg-navy-900 rounded-xl border border-navy-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Carrier: </span>
                      <strong className="text-slate-200">{selectedOrderForAudit.trackingCarrier}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Tracking #: </span>
                      <strong className="font-mono text-electric-400">{selectedOrderForAudit.trackingNumber}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Evaluator Status Advancement Bar */}
              <div className="p-4 bg-navy-950/60 rounded-2xl border border-navy-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-violet-300">
                  <span>Evaluator State Advancement Controls:</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Triggers real SMS/Email/WhatsApp notifications
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleAdvanceStatus(selectedOrderForAudit.id, 'PROCESSING')}
                    disabled={isUpdatingStatus}
                    className="py-1.5 px-2 bg-navy-900 border border-navy-700 hover:border-violet-500/50 hover:bg-navy-850 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Mark Processing
                  </button>
                  <button
                    onClick={() => handleAdvanceStatus(selectedOrderForAudit.id, 'SHIPPED')}
                    disabled={isUpdatingStatus}
                    className="py-1.5 px-2 bg-navy-900 border border-navy-700 hover:border-violet-500/50 hover:bg-navy-850 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Mark Shipped
                  </button>
                  <button
                    onClick={() => handleAdvanceStatus(selectedOrderForAudit.id, 'OUT_FOR_DELIVERY')}
                    disabled={isUpdatingStatus}
                    className="py-1.5 px-2 bg-navy-900 border border-navy-700 hover:border-violet-500/50 hover:bg-navy-850 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Mark Out For Delivery
                  </button>
                  <button
                    onClick={() => handleAdvanceStatus(selectedOrderForAudit.id, 'DELIVERED')}
                    disabled={isUpdatingStatus}
                    className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-glow transition-colors"
                  >
                    Mark Delivered
                  </button>
                </div>
              </div>

              {/* Product and Payment Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-navy-950/70 rounded-2xl border border-navy-800 space-y-2">
                  <span className="font-bold text-slate-200">Product Scrutiny</span>
                  <div className="flex gap-2">
                    <img
                      src={selectedOrderForAudit.productImageUrl}
                      alt={selectedOrderForAudit.productTitle}
                      className="w-12 h-12 object-cover rounded-lg border border-navy-800 bg-navy-950"
                    />
                    <div>
                      <div className="font-semibold text-slate-100 line-clamp-2">
                        {selectedOrderForAudit.productTitle}
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Seller: {selectedOrderForAudit.sellerName}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-navy-950/70 rounded-2xl border border-navy-800 space-y-1.5">
                  <span className="font-bold text-slate-200">Financial Clearance</span>
                  <div className="flex justify-between text-slate-400">
                    <span>Base Amount:</span>
                    <span className="font-mono text-slate-200">₹{selectedOrderForAudit.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping Fee:</span>
                    <span className="font-mono text-slate-200">
                      {selectedOrderForAudit.shippingFee > 0 ? `₹${selectedOrderForAudit.shippingFee}` : 'FREE'}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-100 pt-1 border-t border-navy-800">
                    <span>Total Paid:</span>
                    <span className="font-mono text-violet-400">₹{selectedOrderForAudit.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Verification Certificate */}
              {selectedOrderForAudit.verificationSnapshot && (
                <div className="p-4 bg-emerald-950/30 border border-emerald-800/80 rounded-2xl space-y-2 text-xs">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Evidence-First Verification Certificate</span>
                  </div>
                  <p className="text-emerald-400/90 leading-relaxed">
                    Verification score at time of purchase:{' '}
                    <strong className="text-emerald-300">{selectedOrderForAudit.verificationSnapshot.score}%</strong>. Verified seller status confirmed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
