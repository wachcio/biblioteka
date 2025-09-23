import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type {
  SearchParams,
  CreateBookRequest,
  CreateAuthorRequest,
  CreateReservationRequest,
  CreateLoanRequest
} from '../types';

// Query Keys
export const queryKeys = {
  books: ['books'] as const,
  book: (id: number) => ['books', id] as const,
  authors: ['authors'] as const,
  author: (id: number) => ['authors', id] as const,
  users: ['users'] as const,
  currentUser: ['currentUser'] as const,
  userStats: ['userStats'] as const,
  myReservations: ['myReservations'] as const,
  allReservations: ['allReservations'] as const,
  myLoans: ['myLoans'] as const,
  allLoans: ['allLoans'] as const,
  overdueLoans: ['overdueLoans'] as const,
  bookCategories: ['bookCategories'] as const,
  bookStats: ['bookStats'] as const,
};

// Books
export const useBooks = (params?: SearchParams) => {
  return useQuery({
    queryKey: [...queryKeys.books, params],
    queryFn: () => apiService.getBooks(params),
  });
};

export const useBook = (id: number) => {
  return useQuery({
    queryKey: queryKeys.book(id),
    queryFn: () => apiService.getBook(id),
    enabled: !!id,
  });
};

export const useBookCategories = () => {
  return useQuery({
    queryKey: queryKeys.bookCategories,
    queryFn: () => apiService.getBookCategories(),
  });
};

export const useBookStats = () => {
  return useQuery({
    queryKey: queryKeys.bookStats,
    queryFn: () => apiService.getBookStats(),
  });
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookRequest) => apiService.createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookStats });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateBookRequest> }) =>
      apiService.updateBook(id, data),
    onSuccess: (updatedBook) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
      queryClient.setQueryData(queryKeys.book(updatedBook.id), updatedBook);
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookStats });
    },
  });
};

// Authors
export const useAuthors = (search?: string) => {
  return useQuery({
    queryKey: [...queryKeys.authors, search],
    queryFn: () => apiService.getAuthors(search),
  });
};

export const useAuthor = (id: number) => {
  return useQuery({
    queryKey: queryKeys.author(id),
    queryFn: () => apiService.getAuthor(id),
    enabled: !!id,
  });
};

export const useCreateAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAuthorRequest) => apiService.createAuthor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.authors });
    },
  });
};

export const useUpdateAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateAuthorRequest> }) =>
      apiService.updateAuthor(id, data),
    onSuccess: (updatedAuthor) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.authors });
      queryClient.setQueryData(queryKeys.author(updatedAuthor.id), updatedAuthor);
    },
  });
};

export const useDeleteAuthor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.deleteAuthor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.authors });
    },
  });
};

// Users
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => apiService.getCurrentUser(),
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: queryKeys.userStats,
    queryFn: () => apiService.getUserStats(),
  });
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => apiService.getAllUsers(),
  });
};

// Reservations
export const useMyReservations = () => {
  return useQuery({
    queryKey: queryKeys.myReservations,
    queryFn: () => apiService.getMyReservations(),
  });
};

export const useAllReservations = () => {
  return useQuery({
    queryKey: queryKeys.allReservations,
    queryFn: () => apiService.getAllReservations(),
  });
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationRequest) => apiService.createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myReservations });
      queryClient.invalidateQueries({ queryKey: queryKeys.allReservations });
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
    },
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myReservations });
      queryClient.invalidateQueries({ queryKey: queryKeys.allReservations });
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
    },
  });
};

export const useApproveReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.approveReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allReservations });
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
    },
  });
};

export const useConvertReservationToLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.convertReservationToLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allReservations });
      queryClient.invalidateQueries({ queryKey: queryKeys.allLoans });
      queryClient.invalidateQueries({ queryKey: queryKeys.myLoans });
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
    },
  });
};

// Loans
export const useMyLoans = () => {
  return useQuery({
    queryKey: queryKeys.myLoans,
    queryFn: () => apiService.getMyLoans(),
  });
};

export const useAllLoans = () => {
  return useQuery({
    queryKey: queryKeys.allLoans,
    queryFn: () => apiService.getAllLoans(),
  });
};

export const useOverdueLoans = () => {
  return useQuery({
    queryKey: queryKeys.overdueLoans,
    queryFn: () => apiService.getOverdueLoans(),
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLoanRequest) => apiService.createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allLoans });
      queryClient.invalidateQueries({ queryKey: queryKeys.myLoans });
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
    },
  });
};

export const useReturnLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiService.returnLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allLoans });
      queryClient.invalidateQueries({ queryKey: queryKeys.myLoans });
      queryClient.invalidateQueries({ queryKey: queryKeys.overdueLoans });
      queryClient.invalidateQueries({ queryKey: queryKeys.books });
    },
  });
};

export const useExtendLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, days }: { id: number; days: number }) =>
      apiService.extendLoan(id, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allLoans });
      queryClient.invalidateQueries({ queryKey: queryKeys.myLoans });
      queryClient.invalidateQueries({ queryKey: queryKeys.overdueLoans });
    },
  });
};