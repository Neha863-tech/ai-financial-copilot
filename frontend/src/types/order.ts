export type OrderStatus =
  | 'pending'
  | 'approved'
  | 'captured'
  | 'cancelled'
  | 'failed'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'PAYMENT_FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type LifecycleOrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface VerificationSnapshot {
  score: number;
  warningsAcknowledged: string[];
  explicitUserApproval: boolean;
  approvalTimestamp: string;
  verifiedSellerConfirmed: boolean;
  notes: string;
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productCategory: string;
  productImageUrl: string;
  sellerName: string;
  sellerVerified: boolean;
  amount: number;
  shippingFee: number;
  taxFee: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  orderStatus?: LifecycleOrderStatus;
  paymentStatus?: 'pending' | 'captured' | 'failed' | 'refunded';
  date: string;
  paymentGateway: 'razorpay' | 'paypal_sandbox' | string;
  paypalOrderId?: string;
  paypalPayerEmail?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  trackingCarrier?: string;
  trackingNumber?: string;
  whatsappOptIn?: boolean;
  isDemo?: boolean;
  verificationSnapshot?: VerificationSnapshot;
  createdAt?: string;
  updatedAt?: string;
}
