import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import Pagination from '../../components/ui/Pagination';
import type { Book, Author, CreateBookRequest, BulkBookOperation, User, CreateLoanRequest, CreateReservationRequest } from '../../types';

const AdminBooksManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bulkOperation, setBulkOperation] = useState<'delete' | 'status' | 'category' | null>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedBookForAction, setSelectedBookForAction] = useState<Book | null>(null);

  const queryClient = useQueryClient();
  const limit = 10;

  // Fetch books
  const {
    data: booksData,
    isLoading: booksLoading,
    error: booksError,
  } = useQuery({
    queryKey: ['admin', 'books', currentPage, searchTerm, selectedCategory, selectedStatus],
    queryFn: () => apiService.getBooks({
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
      status: selectedStatus || undefined,
      page: currentPage,
      limit,
    }),
  });

  // Fetch authors for form
  const { data: authors = [] } = useQuery<Author[]>({
    queryKey: ['authors'],
    queryFn: () => apiService.getAuthors(),
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['book-categories'],
    queryFn: () => apiService.getBookCategories(),
  });

  // Fetch users for loan/reservation creation
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => apiService.getAllUsers(),
    enabled: showLoanModal || showReserveModal,
  });

  // Create/Update book mutation
  const bookMutation = useMutation({
    mutationFn: async (data: { book: CreateBookRequest; id?: number }) => {
      if (data.id) {
        return apiService.updateBook(data.id, data.book);
      }
      return apiService.createBook(data.book);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
      setShowAddForm(false);
      setEditingBook(null);
    },
    onError: (error) => {
      console.error('Book mutation error:', error);
      alert('Error saving book: ' + (error as any)?.message || 'Unknown error');
    },
  });

  // Delete book mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
    },
  });

  // Create loan mutation
  const loanMutation = useMutation({
    mutationFn: (data: CreateLoanRequest) => apiService.createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'loans'] });
      setShowLoanModal(false);
      setSelectedBookForAction(null);
    },
    onError: (error) => {
      console.error('Loan creation error:', error);
      alert('Error creating loan: ' + (error as any)?.message || 'Unknown error');
    },
  });

  // Create reservation mutation
  const reservationMutation = useMutation({
    mutationFn: (data: CreateReservationRequest) => apiService.createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] });
      setShowReserveModal(false);
      setSelectedBookForAction(null);
    },
    onError: (error) => {
      console.error('Reservation creation error:', error);
      alert('Error creating reservation: ' + (error as any)?.message || 'Unknown error');
    },
  });


  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSelectBook = (bookId: number) => {
    setSelectedBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBooks.length === (booksData?.books.length || 0)) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(booksData?.books.map(book => book.id) || []);
    }
  };

  const handleBulkOperation = (operation: BulkBookOperation) => {
    if (operation.action === 'delete') {
      // For now, just delete books individually
      selectedBooks.forEach(bookId => {
        deleteMutation.mutate(bookId);
      });
      setSelectedBooks([]);
      setBulkOperation(null);
    }
  };

  if (booksLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (booksError) {
    return (
      <Alert
        type="error"
        title="Error loading books"
        message="Failed to load books data. Please try again."
      />
    );
  }

  const books = booksData?.books || [];
  const totalPages = Math.ceil((booksData?.total || 0) / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Books Management</h1>
          <p className="text-gray-600 mt-2">Manage your library's book collection</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Book
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search books..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearchInput}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="borrowed">Borrowed</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              setSelectedStatus('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bulk Operations */}
      {selectedBooks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedBooks.length} book{selectedBooks.length > 1 ? 's' : ''} selected
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setBulkOperation('delete')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete Selected
              </button>
              <span className="text-xs text-gray-500">
                Note: Status updates coming soon
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Books Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedBooks.length === books.length && books.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Authors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedBooks.includes(book.id)}
                      onChange={() => handleSelectBook(book.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {book.cover_url && (
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded mr-4"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{book.title}</div>
                        {book.isbn && (
                          <div className="text-sm text-gray-500">ISBN: {book.isbn}</div>
                        )}
                        {book.year && (
                          <div className="text-sm text-gray-500">Year: {book.year}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {book.bookAuthors.map(ba => `${ba.author.first_name} ${ba.author.last_name}`).join(', ')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {book.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          book.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : book.status === 'reserved'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400" title="Status is automatically managed based on loans and reservations">
                        (Auto)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(book.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {book.status === 'available' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedBookForAction(book);
                              setShowLoanModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 px-2 py-1 text-xs border border-green-600 rounded hover:bg-green-50"
                            title="Create loan for this book"
                          >
                            Loan
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBookForAction(book);
                              setShowReserveModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-900 px-2 py-1 text-xs border border-orange-600 rounded hover:bg-orange-50"
                            title="Create reservation for this book"
                          >
                            Reserve
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setEditingBook(book)}
                        className="text-blue-600 hover:text-blue-900 px-2 py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this book?')) {
                            deleteMutation.mutate(book.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Add/Edit Book Form Modal */}
      {(showAddForm || editingBook) && (
        <BookFormModal
          book={editingBook}
          authors={authors}
          categories={categories}
          onClose={() => {
            setShowAddForm(false);
            setEditingBook(null);
          }}
          onSubmit={(data) => {
            bookMutation.mutate({
              book: data,
              id: editingBook?.id,
            });
          }}
          isLoading={bookMutation.isPending}
        />
      )}

      {/* Bulk Operation Modal */}
      {bulkOperation === 'delete' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setBulkOperation(null)} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Books</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete {selectedBooks.length} book{selectedBooks.length > 1 ? 's' : ''}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setBulkOperation(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBulkOperation({ action: 'delete', bookIds: selectedBooks })}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Loan Modal */}
      {showLoanModal && selectedBookForAction && (
        <CreateLoanModal
          book={selectedBookForAction}
          users={users}
          onClose={() => {
            setShowLoanModal(false);
            setSelectedBookForAction(null);
          }}
          onSubmit={(data) => loanMutation.mutate(data)}
          isLoading={loanMutation.isPending}
        />
      )}

      {/* Create Reservation Modal */}
      {showReserveModal && selectedBookForAction && (
        <CreateReservationModal
          book={selectedBookForAction}
          users={users}
          onClose={() => {
            setShowReserveModal(false);
            setSelectedBookForAction(null);
          }}
          onSubmit={(data) => reservationMutation.mutate(data)}
          isLoading={reservationMutation.isPending}
        />
      )}
    </div>
  );
};

// Book Form Modal Component
interface BookFormModalProps {
  book: Book | null;
  authors: Author[];
  categories: string[];
  onClose: () => void;
  onSubmit: (data: CreateBookRequest) => void;
  isLoading: boolean;
}

const BookFormModal: React.FC<BookFormModalProps> = ({
  book,
  authors,
  categories,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateBookRequest>({
    title: book?.title || '',
    year: book?.year || undefined,
    isbn: book?.isbn || '',
    category: book?.category || '',
    description: book?.description || '',
    cover_url: book?.cover_url || '',
    authorIds: book?.bookAuthors.map(ba => ba.author_id) || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {book ? 'Edit Book' : 'Add New Book'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authors *
              </label>
              <select
                multiple
                required
                value={formData.authorIds.map(String)}
                onChange={(e) => {
                  const selectedValues = Array.from(e.target.selectedOptions, option => Number(option.value));
                  setFormData({ ...formData, authorIds: selectedValues });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              >
                {authors.map(author => (
                  <option key={author.id} value={author.id}>
                    {author.first_name} {author.last_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple authors</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  min="1000"
                  max={new Date().getFullYear()}
                  value={formData.year || ''}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  list="categories"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="categories">
                  {categories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ISBN
              </label>
              <input
                type="text"
                value={formData.isbn || ''}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover URL
              </label>
              <input
                type="url"
                value={formData.cover_url || ''}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                {isLoading ? 'Saving...' : book ? 'Update Book' : 'Add Book'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Create Loan Modal Component
interface CreateLoanModalProps {
  book: Book;
  users: User[];
  onClose: () => void;
  onSubmit: (data: CreateLoanRequest) => void;
  isLoading: boolean;
}

const CreateLoanModal: React.FC<CreateLoanModalProps> = ({
  book,
  users,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateLoanRequest>({
    user_id: 0,
    book_id: book.id,
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create Loan</h3>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Book:</strong> {book.title}
            </p>
          </div>

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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
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

// Create Reservation Modal Component
interface CreateReservationModalProps {
  book: Book;
  users: User[];
  onClose: () => void;
  onSubmit: (data: CreateReservationRequest) => void;
  isLoading: boolean;
}

const CreateReservationModal: React.FC<CreateReservationModalProps> = ({
  book,
  users,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData] = useState<CreateReservationRequest>({
    book_id: book.id,
  });

  const [selectedUserId, setSelectedUserId] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      // Note: Current API creates reservation for the logged-in admin, not the selected user
      // This is a temporary workaround until admin API is available
      alert('Note: Reservation will be created for the currently logged-in admin user, not the selected user. Admin reservation API needs to be implemented.');
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create Reservation</h3>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Book:</strong> {book.title}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User *
              </label>
              <select
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
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

            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> The reservation will be created for the selected user. They will be notified when the book becomes available.
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
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Reservation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminBooksManagement;