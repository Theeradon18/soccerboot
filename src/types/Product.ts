// =========================================================================
// ⚽ BOOTZONE E-COMMERCE DATA TYPES & CONTRACTS
// =========================================================================

export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  full_name: string;
  name?: string; // Compatibility alias
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  address?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  color: string;
  size: string;
  stock: number;
  category: string;
  description: string;
  image_url: string;
  created_at?: string;
}

export type ProductFormData = Omit<Product, 'id' | 'created_at'>;

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  brand: string;
  model: string;
  size: string;
  price: number;
  quantity: number;
  image_url: string;
  stock: number;
}

export interface ShippingAddress {
  fullName?: string;
  phone?: string;
  address: string;
  district: string;
  province: string;
  postalCode: string;
}

export type PaymentMethod = 'Bank Transfer' | 'PromptPay' | 'Cash on Delivery';
export type PaymentStatus = 'Pending' | 'Waiting for Verification' | 'Paid' | 'Rejected' | 'Refunded';
export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';

export interface Order {
  id: string; // e.g. #BZ20260001
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentSlip?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  rejectReason?: string;
  createdAt: string;
}

export interface PaymentVerification {
  id: string;
  orderId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentSlip?: string;
  paymentSlipUrl?: string;
  status?: PaymentStatus;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  rejectReason?: string;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
