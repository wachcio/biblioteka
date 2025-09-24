import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Book,
  Author,
  Reservation,
  CreateUserRequest,
  Loan,
  CreateBookRequest,
  CreateAuthorRequest,
  CreateReservationRequest,
  CreateLoanRequest,
  SearchParams,
  AdminStats,
  RecentActivity,
  UpdateUserRoleRequest,
  BulkBookOperation
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      timeout: 10000,
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.access_token);
              return this.api.request(error.config);
            } catch (refreshError) {
              this.logout();
              window.location.href = '/login';
            }
          } else {
            this.logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    const response = await this.api.post<{ access_token: string }>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // User methods
  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/users/me');
    return response.data;
  }

  async getUserStats(): Promise<any> {
    const response = await this.api.get('/users/me/stats');
    return response.data;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.api.get<User[]>('/users');
    return response.data;
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await this.api.post<User>('/users', data);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  // Books methods
  async getBooks(params?: SearchParams): Promise<{ books: Book[]; total: number }> {
    const response = await this.api.get<{ books: Book[]; total: number }>('/books', { params });
    return response.data;
  }

  async getBook(id: number): Promise<Book> {
    const response = await this.api.get<Book>(`/books/${id}`);
    return response.data;
  }

  async createBook(data: CreateBookRequest): Promise<Book> {
    const response = await this.api.post<Book>('/books', data);
    return response.data;
  }

  async updateBook(id: number, data: Partial<CreateBookRequest>): Promise<Book> {
    const response = await this.api.patch<Book>(`/books/${id}`, data);
    return response.data;
  }

  async deleteBook(id: number): Promise<void> {
    await this.api.delete(`/books/${id}`);
  }

  async getBookCategories(): Promise<string[]> {
    const response = await this.api.get<string[]>('/books/categories');
    return response.data;
  }

  async getBookStats(): Promise<any> {
    const response = await this.api.get('/books/stats');
    return response.data;
  }

  // Authors methods
  async getAuthors(search?: string): Promise<Author[]> {
    const response = await this.api.get<Author[]>('/authors', { params: { search } });
    return response.data;
  }

  async getAuthor(id: number): Promise<Author> {
    const response = await this.api.get<Author>(`/authors/${id}`);
    return response.data;
  }

  async createAuthor(data: CreateAuthorRequest): Promise<Author> {
    const response = await this.api.post<Author>('/authors', data);
    return response.data;
  }

  async updateAuthor(id: number, data: Partial<CreateAuthorRequest>): Promise<Author> {
    const response = await this.api.patch<Author>(`/authors/${id}`, data);
    return response.data;
  }

  async deleteAuthor(id: number): Promise<void> {
    await this.api.delete(`/authors/${id}`);
  }

  // Reservations methods
  async getMyReservations(): Promise<Reservation[]> {
    const response = await this.api.get<Reservation[]>('/reservations/my-reservations');
    return response.data;
  }

  async getAllReservations(): Promise<Reservation[]> {
    const response = await this.api.get<Reservation[]>('/reservations');
    return response.data;
  }

  async createReservation(data: CreateReservationRequest): Promise<Reservation> {
    const response = await this.api.post<Reservation>('/reservations', data);
    return response.data;
  }

  async cancelReservation(id: number): Promise<void> {
    await this.api.patch(`/reservations/${id}`, { status: 'cancelled' });
  }

  async approveReservation(id: number): Promise<Reservation> {
    const response = await this.api.patch<Reservation>(`/reservations/${id}/approve`);
    return response.data;
  }

  async convertReservationToLoan(id: number): Promise<Loan> {
    const response = await this.api.patch<Loan>(`/reservations/${id}/convert-to-loan`);
    return response.data;
  }

  // Loans methods
  async getMyLoans(): Promise<Loan[]> {
    const response = await this.api.get<Loan[]>('/loans/my-loans');
    return response.data;
  }

  async getAllLoans(): Promise<Loan[]> {
    const response = await this.api.get<{ loans: Loan[], total: number }>('/loans');
    return response.data.loans;
  }

  async getOverdueLoans(): Promise<Loan[]> {
    const response = await this.api.get<Loan[]>('/loans/overdue');
    return response.data;
  }

  async createLoan(data: CreateLoanRequest): Promise<Loan> {
    const response = await this.api.post<Loan>('/loans', data);
    return response.data;
  }

  async returnLoan(id: number): Promise<Loan> {
    const response = await this.api.post<Loan>(`/loans/${id}/return`);
    return response.data;
  }

  async extendLoan(id: number, days: number): Promise<Loan> {
    // Get current loan to use its due_date
    const currentLoan = await this.api.get<Loan>(`/loans/${id}`);
    const newDueDate = new Date(currentLoan.data.due_date);
    newDueDate.setDate(newDueDate.getDate() + days);
    const response = await this.api.post<Loan>(`/loans/${id}/extend`, {
      newDueDate: newDueDate.toISOString()
    });
    return response.data;
  }

  // Admin methods
  async getAdminStats(): Promise<AdminStats> {
    const response = await this.api.get<AdminStats>('/admin/stats');
    return response.data;
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    const response = await this.api.get<RecentActivity[]>('/admin/activity');
    return response.data;
  }

  async updateUserRole(userId: number, data: UpdateUserRoleRequest): Promise<User> {
    const response = await this.api.patch<User>(`/admin/users/${userId}/role`, data);
    return response.data;
  }

  async bulkBookOperation(operation: BulkBookOperation): Promise<void> {
    await this.api.post('/admin/books/bulk', operation);
  }

  async getUserActivity(userId: number): Promise<any> {
    const response = await this.api.get(`/admin/users/${userId}/activity`);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();