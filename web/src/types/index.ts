export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Author {
  id: number;
  first_name: string;
  last_name: string;
  bio?: string;
  created_at: string;
  fullName: string;
}

export interface Book {
  id: number;
  title: string;
  year?: number;
  isbn?: string;
  category?: string;
  description?: string;
  cover_url?: string;
  status: 'available' | 'reserved' | 'borrowed';
  created_at: string;
  bookAuthors: BookAuthor[];
}

export interface BookAuthor {
  book_id: number;
  author_id: number;
  author: Author;
}

export interface Reservation {
  id: number;
  user_id: number;
  book_id: number;
  reserved_at: string;
  expires_at?: string;
  status: 'active' | 'cancelled' | 'expired' | 'converted';
  user: User;
  book: Book;
}

export interface Loan {
  id: number;
  user_id: number;
  book_id: number;
  admin_id: number;
  borrowed_at: string;
  due_date: string;
  returned_at?: string;
  status: 'active' | 'returned' | 'overdue';
  user: User;
  book: Book;
  admin: User;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateBookRequest {
  title: string;
  year?: number;
  isbn?: string;
  category?: string;
  description?: string;
  cover_url?: string;
  authorIds: number[];
}

export interface CreateAuthorRequest {
  first_name: string;
  last_name: string;
  bio?: string;
}

export interface CreateReservationRequest {
  book_id: number;
}

export interface CreateLoanRequest {
  user_id: number;
  book_id: number;
  due_date?: string;
}

export interface SearchParams {
  search?: string;
  category?: string;
  status?: string;
  authorId?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Admin-specific interfaces
export interface AdminStats {
  totalBooks: number;
  totalUsers: number;
  activeLoans: number;
  overdueLoans: number;
  activeReservations: number;
  availableBooks: number;
  borrowedBooks: number;
  reservedBooks: number;
}

export interface RecentActivity {
  id: number;
  type: 'loan' | 'reservation' | 'return' | 'user_registration';
  description: string;
  user?: User;
  book?: Book;
  created_at: string;
}

export interface UpdateUserRoleRequest {
  role: 'admin' | 'user';
}

export interface BulkBookOperation {
  action: 'delete' | 'update_status' | 'update_category';
  bookIds: number[];
  data?: {
    status?: 'available' | 'reserved' | 'borrowed';
    category?: string;
  };
}

export interface ExtendLoanRequest {
  days: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}