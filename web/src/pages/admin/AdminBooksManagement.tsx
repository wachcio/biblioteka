import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import Pagination from '../../components/ui/Pagination';
import type { Book, Author, CreateBookRequest, BulkBookOperation } from '../../types';

const AdminBooksManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bulkOperation, setBulkOperation] = useState<'delete' | 'status' | 'category' | null>(null);

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
  });

  // Delete book mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
    },
  });

  // Bulk operations mutation
  const bulkMutation = useMutation({
    mutationFn: (operation: BulkBookOperation) => apiService.bulkBookOperation(operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
      setSelectedBooks([]);
      setBulkOperation(null);
    },
  });

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

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
    bulkMutation.mutate({
      ...operation,
      bookIds: selectedBooks,
    });
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
              onChange={(e) => handleSearch(e.target.value)}
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
                onClick={() => setBulkOperation('status')}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Update Status
              </button>
              <button
                onClick={() => setBulkOperation('category')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Update Category
              </button>
              <button
                onClick={() => setBulkOperation('delete')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete Selected
              </button>
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
                    {book.bookAuthors.map(ba => ba.author.fullName).join(', ')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {book.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
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
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(book.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => setEditingBook(book)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this book?')) {
                          deleteMutation.mutate(book.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
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
      {bulkOperation && (
        <BulkOperationModal
          operation={bulkOperation}
          count={selectedBooks.length}
          categories={categories}
          onClose={() => setBulkOperation(null)}
          onConfirm={handleBulkOperation}
          isLoading={bulkMutation.isPending}
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
                    {author.fullName}
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

// Bulk Operation Modal Component
interface BulkOperationModalProps {
  operation: 'delete' | 'status' | 'category';
  count: number;
  categories: string[];
  onClose: () => void;
  onConfirm: (operation: BulkBookOperation) => void;
  isLoading: boolean;
}

const BulkOperationModal: React.FC<BulkOperationModalProps> = ({
  operation,
  count,
  categories,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [status, setStatus] = useState<'available' | 'reserved' | 'borrowed'>('available');
  const [category, setCategory] = useState('');

  const handleConfirm = () => {
    if (operation === 'delete') {
      onConfirm({ action: 'delete', bookIds: [] });
    } else if (operation === 'status') {
      onConfirm({
        action: 'update_status',
        bookIds: [],
        data: { status },
      });
    } else if (operation === 'category') {
      onConfirm({
        action: 'update_category',
        bookIds: [],
        data: { category },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {operation === 'delete' ? 'Delete Books' :
             operation === 'status' ? 'Update Status' :
             'Update Category'}
          </h3>

          <p className="text-gray-600 mb-4">
            This action will affect {count} book{count > 1 ? 's' : ''}:
          </p>

          {operation === 'status' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="borrowed">Borrowed</option>
              </select>
            </div>
          )}

          {operation === 'category' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Category
              </label>
              <input
                type="text"
                list="categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <datalist id="categories">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || (operation === 'category' && !category)}
              className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                operation === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBooksManagement;