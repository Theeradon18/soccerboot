import { Platform } from 'react-native';
import { Product, ProductFormData, LoginResponse } from '../types/Product';

/**
 * =========================================================================
 * ⚙️ การตั้งค่า IP ADDRESS ของ BACKEND API
 * =========================================================================
 * - ถ้าทดสอบบน เว็บเบราว์เซอร์ (Web) หรือ iOS Simulator: ใช้ 'localhost'
 * - ถ้าทดสอบบน Android Emulator: ใช้ '10.0.2.2'
 * - ถ้าทดสอบบน มือถือจริงผ่าน Expo Go: ใส่เลข IP เครื่องคอมพิวเตอร์ของคุณ
 *   (เช่น '192.168.1.78' ตรวจสอบได้จากคำสั่ง ipconfig ใน cmd)
 * =========================================================================
 */
const YOUR_COMPUTER_IP = '192.168.1.78'; // <-- ใส่ IP คอมพิวเตอร์ของคุณตรงนี้เมื่อรันบนมือถือจริง
const PORT = '5000';

export const getBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return `http://localhost:${PORT}`;
  }
  if (Platform.OS === 'android') {
    // ถ้าใช้เครื่องจริงให้ใช้ YOUR_COMPUTER_IP ถ้า Emulator ใช้ 10.0.2.2
    return `http://${YOUR_COMPUTER_IP}:${PORT}`;
  }
  return `http://localhost:${PORT}`;
};

const API_BASE_URL = getBaseUrl();

export const api = {
  // 1. เข้าสู่ระบบ (Login)
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }
      return data;
    } catch (error: any) {
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error(`ไม่สามารถเชื่อมต่อ Server ได้ (${API_BASE_URL}) กรุณาตรวจสอบว่ารัน backend แล้ว`);
      }
      throw error;
    }
  },

  // 2. ดึงรายการสินค้าทั้งหมด (Get Products)
  async getProducts(search?: string): Promise<Product[]> {
    try {
      const url = search && search.trim()
        ? `${API_BASE_URL}/products?search=${encodeURIComponent(search.trim())}`
        : `${API_BASE_URL}/products`;

      const response = await fetch(url);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'ไม่สามารถโหลดรายการสินค้าได้');
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error(`ไม่สามารถเชื่อมต่อ Server ได้ (${API_BASE_URL}) กรุณาตรวจสอบว่ารัน backend แล้ว`);
      }
      throw error;
    }
  },

  // 3. ดึงข้อมูลสินค้ารายชิ้น (Get Product Detail)
  async getProductById(id: string): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'ไม่พบสินค้า');
      }
      return await response.json();
    } catch (error: any) {
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error(`ไม่สามารถเชื่อมต่อ Server ได้ (${API_BASE_URL})`);
      }
      throw error;
    }
  },

  // 4. เพิ่มสินค้าใหม่ (Add Product)
  async createProduct(productData: ProductFormData): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'เพิ่มสินค้าไม่สำเร็จ');
      }
      return result.data;
    } catch (error: any) {
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error(`ไม่สามารถเชื่อมต่อ Server ได้ (${API_BASE_URL})`);
      }
      throw error;
    }
  },

  // 5. แก้ไขข้อมูลสินค้า (Edit Product)
  async updateProduct(id: string, productData: Partial<ProductFormData>): Promise<Product> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'แก้ไขสินค้าไม่สำเร็จ');
      }
      return result.data;
    } catch (error: any) {
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error(`ไม่สามารถเชื่อมต่อ Server ได้ (${API_BASE_URL})`);
      }
      throw error;
    }
  },

  // 6. ลบสินค้า (Delete Product)
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'ลบสินค้าไม่สำเร็จ');
      }
      return true;
    } catch (error: any) {
      if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
        throw new Error(`ไม่สามารถเชื่อมต่อ Server ได้ (${API_BASE_URL})`);
      }
      throw error;
    }
  },
};
