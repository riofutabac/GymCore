// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

// User Types
export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  RECEPTION = 'RECEPTION',
  CLIENT = 'CLIENT',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;       // ← Agregar esta línea
  avatarUrl?: string;   // ← Agregar esta línea
  role: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  metadata?: Record<string, any>;
  memberOfGyms?: {
    id: string;
    name: string;
    role: string;
    membershipStatus: MembershipStatus;
    membershipEndDate?: string;
  }[];
  updatedAt: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// No longer needed with Supabase Auth
export interface AuthResponse {
  user: User;
}

// Gym Types
export interface Gym {
  id: string;
  name: string;
  address: string;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGymRequest {
  name: string;
  address: string;
  managerId?: string;
}

export interface UpdateGymRequest {
  name?: string;
  address?: string;
  managerId?: string;
  isActive?: boolean;
}

// Member Types
export interface Member {
  id: string;
  userId: string;
  gymId: string;
  user: User;
  membershipStatus: MembershipStatus;
  membershipEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED',
}

export interface CreateMemberRequest {
  email: string;
  name: string;
  password: string;
}

export interface UpdateMembershipRequest {
  membershipEndDate: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  gymId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}

// Sale Types
export interface Sale {
  id: string;
  gymId: string;
  userId: string;
  clientId?: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleRequest {
  clientId?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

// Access Log Types
export interface AccessLog {
  id: string;
  gymId: string;
  userId: string;
  user: User;
  createdAt: string;
}

export interface QRData {
  userId: string;
  gymId: string;
  token: string;
  expiresAt: string;
}
