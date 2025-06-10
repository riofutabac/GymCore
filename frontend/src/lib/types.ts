
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'SYS_ADMIN' | 'MANAGER' | 'RECEPTION' | 'CLIENT';
  gymId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Gym {
  id: string;
  name: string;
  address: string;
  description?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  joinCode: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  userId: string;
  gymId: string;
  membershipType: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  qrCode: string;
  user: User;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  gymId: string;
  image?: string;
}

export interface Sale {
  id: string;
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
  items: SaleItem[];
  gymId: string;
  userId: string;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface AccessLog {
  id: string;
  memberId: string;
  gymId: string;
  entryTime: string;
  exitTime?: string;
  accessType: 'QR' | 'MANUAL';
  member: Member;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
