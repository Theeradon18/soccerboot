import { Platform } from 'react-native';
import {
  CartItem,
  LoginResponse,
  Order,
  PaymentVerification,
  Product,
  ProductFormData,
  RegisterResponse,
  User,
} from '../types/Product';

/**
 * =========================================================================
 * ⚙️ BACKEND API CONFIGURATION
 * =========================================================================
 */
const YOUR_COMPUTER_IP = '192.168.1.78';
const PORT = '5000';

export const getBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return `http://localhost:${PORT}`;
  }
  if (Platform.OS === 'android') {
    return `http://${YOUR_COMPUTER_IP}:${PORT}`;
  }
  return `http://localhost:${PORT}`;
};

const API_BASE_URL = getBaseUrl();

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
}

function catchNetworkError(error: any): never {
  if (
    error.message?.includes('Network request failed') ||
    error.message?.includes('Failed to fetch')
  ) {
    throw new Error(`ไม่สามารถเชื่อมต่อ Server ได้ (${API_BASE_URL}) กรุณาตรวจสอบว่ารัน backend แล้ว`);
  }
  throw error;
}

export const api = {
  // -------------------------------------------------------------
  // 1. AUTHENTICATION & USERS
  // -------------------------------------------------------------
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      return await handleResponse<LoginResponse>(response);
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async register(data: {
    full_name: string;
    username: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await handleResponse<RegisterResponse>(response);
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      return await handleResponse<User[]>(response);
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async getAllUsers(): Promise<User[]> {
    return this.getUsers();
  },

  async getUserById(id: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      return await handleResponse<User>(response);
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async updateUser(id: string, data: Partial<User>): Promise<{ success: boolean; user: User }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await handleResponse<{ success: boolean; user: User }>(response);
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  // -------------------------------------------------------------
  // 2. PRODUCTS CRUD
  // -------------------------------------------------------------
  async getProducts(search?: string): Promise<Product[]> {
    try {
      const url = search && search.trim()
        ? `${API_BASE_URL}/products?search=${encodeURIComponent(search.trim())}`
        : `${API_BASE_URL}/products`;

      const response = await fetch(url);
      return await handleResponse<Product[]>(response);
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      return await handleResponse<Product>(response);
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async createProduct(productData: ProductFormData): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const res = await handleResponse<{ success: boolean; data: Product }>(response);
      return res.data;
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async updateProduct(id: string, productData: Partial<ProductFormData>): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const res = await handleResponse<{ success: boolean; data: Product }>(response);
      return res.data;
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      await handleResponse<{ success: boolean }>(response);
      return true;
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  // -------------------------------------------------------------
  // 3. CART
  // -------------------------------------------------------------
  async getCart(userId: string): Promise<CartItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${userId}`);
      return await handleResponse<CartItem[]>(response);
    } catch (err: any) {
      console.warn('Backend cart fetch failed, using local cart:', err.message);
      return [];
    }
  },

  async saveCart(userId: string, items: CartItem[]): Promise<CartItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, items }),
      });
      const res = await handleResponse<{ success: boolean; cart: CartItem[] }>(response);
      return res.cart;
    } catch (err: any) {
      return items;
    }
  },

  async clearCart(userId: string): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL}/cart/clear/${userId}`, { method: 'DELETE' });
      return true;
    } catch (err: any) {
      return true;
    }
  },

  // -------------------------------------------------------------
  // 4. ORDERS
  // -------------------------------------------------------------
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const res = await handleResponse<{ success: boolean; order: Order }>(response);
      return res.order;
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${userId}`);
      return await handleResponse<Order[]>(response);
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/detail/${id}`);
      return await handleResponse<Order>(response);
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async getOrderDetail(id: string): Promise<Order> {
    return this.getOrderById(id);
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/admin/all`);
      return await handleResponse<Order[]>(response);
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const res = await handleResponse<{ success: boolean; order: Order }>(response);
      return res.order;
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  // -------------------------------------------------------------
  // 5. PAYMENTS & SLIPS
  // -------------------------------------------------------------
  async uploadPaymentSlip(orderId: string, slipUrl: string): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/slip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, slipUrl }),
      });
      const res = await handleResponse<{ success: boolean; order: Order }>(response);
      return res.order;
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async getAdminPayments(): Promise<PaymentVerification[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/admin`);
      return await handleResponse<PaymentVerification[]>(response);
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async approvePayment(orderId: string): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${orderId}/approve`, {
        method: 'PUT',
      });
      const res = await handleResponse<{ success: boolean; order: Order }>(response);
      return res.order;
    } catch (err: any) {
      catchNetworkError(err);
    }
  },

  async rejectPayment(orderId: string, reason: string): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${orderId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const res = await handleResponse<{ success: boolean; order: Order }>(response);
      return res.order;
    } catch (err: any) {
      catchNetworkError(err);
    }
  },
};
