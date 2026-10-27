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

export interface User {
  username: string;
  role: string;
  name: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
