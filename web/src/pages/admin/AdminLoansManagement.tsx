import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import type { Loan, User, Book, CreateLoanRequest } from '../../types';

const AdminLoansManagement: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [extendingLoan, setExtendingLoan] = useState<Loan | null>(null);

  const queryClient = useQueryClient();

  // Fetch loans
  const {
    data: loans = [],
    isLoading: loansLoading,
    error: loansError,
  } = useQuery<Loan[]>({
    queryKey: ['admin', 'loans'],
    queryFn: () => apiService.getAllLoans(),
  });

  // Fetch overdue loans
  const {
    data: overdueLoans = [],
  } = useQuery<Loan[]>({
    queryKey: ['admin', 'overdue-loans'],
    queryFn: () => apiService.getOverdueLoans(),
  });

  // Fetch users for loan creation
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => apiService.getAllUsers(),
    enabled: showCreateForm,
  });

  // Fetch available books for loan creation
  const { data: availableBooks } = useQuery<{ books: Book[] }>({
    queryKey: ['available-books'],
    queryFn: () => apiService.getBooks({ status: 'available' }),
    enabled: showCreateForm,
  });

  // Return loan mutation
  const returnMutation = useMutation({
    mutationFn: (id: number) => apiService.returnLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'loans'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overdue-loans'] });
    },
  });

  // Extend loan mutation
  const extendMutation = useMutation({
    mutationFn: ({ id, days }: { id: number; days: number }) =>
      apiService.extendLoan(id, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'loans'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overdue-loans'] });
      setExtendingLoan(null);
    },
  });

  // Create loan mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateLoanRequest) => apiService.createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'loans'] });
      setShowCreateForm(false);
    },
  });

  // Filter loans
  const filteredLoans = Array.isArray(loans) ? loans.filter(loan => {
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    const matchesSearch = !searchTerm ||
      loan.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  }) : [];

  const handleReturn = (id: number) => {
    if (window.confirm('Are you sure you want to mark this loan as returned?')) {
      returnMutation.mutate(id);
    }
  };

  const handleExtend = (loan: Loan) => {
    setExtendingLoan(loan);
  };

  const isOverdue = (loan: Loan) => {
    return loan.status === 'active' && new Date(loan.due_date) < new Date();
  };

  if (loansLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (loansError) {
    return (
      <Alert
        type="error"
        title="Error loading loans"
        message="Failed to load loans data. Please try again."
      />
    );
  }

  const stats = {
    total: Array.isArray(loans) ? loans.length : 0,
    active: Array.isArray(loans) ? loans.filter(l => l.status === 'active').length : 0,
    returned: Array.isArray(loans) ? loans.filter(l => l.status === 'returned').length : 0,
    overdue: Array.isArray(overdueLoans) ? overdueLoans.length : 0,
  };

  const getStatusColor = (status: string, loan?: Loan) => {
    if (loan && isOverdue(loan)) {
      return 'bg-red-100 text-red-800';
    }
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loans Management</h1>
          <p className="text-gray-600 mt-2">Manage book loans and returns</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Loan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Loans</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Loans</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-50">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Returned</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.returned}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {stats.overdue > 0 && (
        <Alert
          type="warning"
          title="Overdue Books Alert"
          message={`There are ${stats.overdue} overdue book${stats.overdue > 1 ? 's' : ''} that need attention.`}
        />
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by book title, user name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="returned">Returned</option>
            <option value="overdue">Overdue</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrower
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Borrowed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Returned
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLoans.map((loan) => (
                <tr
                  key={loan.id}
                  className={`hover:bg-gray-50 ${
                    isOverdue(loan) ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {loan.book.cover_url && (
                        <img
                          src={loan.book.cover_url}
                          alt={loan.book.title}
                          className="w-10 h-12 object-cover rounded mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {loan.book.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          #{loan.book.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {loan.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {loan.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(loan.status, loan)}`}>
                      {isOverdue(loan) ? 'Overdue' : loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(loan.borrowed_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={isOverdue(loan) ? 'text-red-600 font-medium' : 'text-gray-500'}>
                      {new Date(loan.due_date).toLocaleDateString()}
                    </span>
                    {isOverdue(loan) && (
                      <div className="text-xs text-red-600">
                        {Math.ceil((new Date().getTime() - new Date(loan.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {loan.returned_at
                      ? new Date(loan.returned_at).toLocaleDateString()
                      : 'Not returned'
                    }
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end items-center space-x-2">
                      {loan.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleExtend(loan)}
                            disabled={extendMutation.isPending}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            Extend
                          </button>
                          <button
                            onClick={() => handleReturn(loan.id)}
                            disabled={returnMutation.isPending}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            Return
                          </button>
                        </>
                      )}
                      {loan.status === 'returned' && (
                        <span className="text-gray-400">Completed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLoans.length === 0 && !loansLoading && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all'
              ? 'No loans match your search criteria.'
              : 'There are no loans in the system yet.'
            }
          </p>
        </div>
      )}

      {/* Create Loan Modal */}
      {showCreateForm && (
        <CreateLoanModal
          users={users}
          books={availableBooks?.books || []}
          onClose={() => setShowCreateForm(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Extend Loan Modal */}
      {extendingLoan && (
        <ExtendLoanModal
          loan={extendingLoan}
          onClose={() => setExtendingLoan(null)}
          onSubmit={(days) => {
            extendMutation.mutate({
              id: extendingLoan.id,
              days,
            });
          }}
          isLoading={extendMutation.isPending}
        />
      )}
    </div>
  );
};

// Create Loan Modal Component
interface CreateLoanModalProps {
  users: User[];
  books: Book[];
  onClose: () => void;
  onSubmit: (data: CreateLoanRequest) => void;
  isLoading: boolean;
}

const CreateLoanModal: React.FC<CreateLoanModalProps> = ({
  users,
  books,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateLoanRequest>({
    user_id: 0,
    book_id: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.user_id && formData.book_id) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Loan</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User *
              </label>
              <select
                required
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book *
              </label>
              <select
                required
                value={formData.book_id}
                onChange={(e) => setFormData({ ...formData, book_id: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a book</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date || ''}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for default loan period
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Loan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Extend Loan Modal Component
interface ExtendLoanModalProps {
  loan: Loan;
  onClose: () => void;
  onSubmit: (days: number) => void;
  isLoading: boolean;
}

const ExtendLoanModal: React.FC<ExtendLoanModalProps> = ({
  loan,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [days, setDays] = useState(7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(days);
  };

  const newDueDate = new Date(loan.due_date);
  newDueDate.setDate(newDueDate.getDate() + days);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Extend Loan</h3>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <strong>Book:</strong> {loan.book.title}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Borrower:</strong> {loan.user.name}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Current Due Date:</strong> {new Date(loan.due_date).toLocaleDateString()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extend by (days) *
              </label>
              <select
                required
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={21}>21 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>New Due Date:</strong> {newDueDate.toLocaleDateString()}
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Extending...' : 'Extend Loan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoansManagement;