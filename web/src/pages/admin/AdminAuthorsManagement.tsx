import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Alert from '../../components/ui/Alert';
import type { Author, CreateAuthorRequest, Book } from '../../types';

const AdminAuthorsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [viewingAuthor, setViewingAuthor] = useState<Author | null>(null);

  const queryClient = useQueryClient();

  // Fetch authors
  const {
    data: authors = [],
    isLoading: authorsLoading,
    error: authorsError,
  } = useQuery<Author[]>({
    queryKey: ['authors', searchTerm],
    queryFn: () => apiService.getAuthors(searchTerm || undefined),
  });

  // Fetch author details and books when viewing
  const {
    data: authorBooks,
    isLoading: booksLoading,
  } = useQuery<{ books: Book[] }>({
    queryKey: ['author-books', viewingAuthor?.id],
    queryFn: () => apiService.getBooks({ authorId: viewingAuthor?.id }),
    enabled: !!viewingAuthor,
  });

  // Create/Update author mutation
  const authorMutation = useMutation({
    mutationFn: async (data: { author: CreateAuthorRequest; id?: number }) => {
      if (data.id) {
        return apiService.updateAuthor(data.id, data.author);
      }
      return apiService.createAuthor(data.author);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      setShowAddForm(false);
      setEditingAuthor(null);
    },
  });

  // Delete author mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteAuthor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
  });

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  if (authorsLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (authorsError) {
    return (
      <Alert
        type="error"
        title="Error loading authors"
        message="Failed to load authors data. Please try again."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Authors Management</h1>
          <p className="text-gray-600 mt-2">Manage your library's authors</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Author
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search authors by name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.map((author) => (
          <AuthorCard
            key={author.id}
            author={author}
            onEdit={() => setEditingAuthor(author)}
            onView={() => setViewingAuthor(author)}
            onDelete={() => {
              if (window.confirm(`Are you sure you want to delete ${author.fullName}?`)) {
                deleteMutation.mutate(author.id);
              }
            }}
            isDeleting={deleteMutation.isPending}
          />
        ))}
      </div>

      {authors.length === 0 && !authorsLoading && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No authors found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No authors match your search criteria.' : 'Get started by adding your first author.'}
          </p>
        </div>
      )}

      {/* Add/Edit Author Form Modal */}
      {(showAddForm || editingAuthor) && (
        <AuthorFormModal
          author={editingAuthor}
          onClose={() => {
            setShowAddForm(false);
            setEditingAuthor(null);
          }}
          onSubmit={(data) => {
            authorMutation.mutate({
              author: data,
              id: editingAuthor?.id,
            });
          }}
          isLoading={authorMutation.isPending}
        />
      )}

      {/* Author Details Modal */}
      {viewingAuthor && (
        <AuthorDetailsModal
          author={viewingAuthor}
          books={authorBooks?.books || []}
          isLoading={booksLoading}
          onClose={() => setViewingAuthor(null)}
          onEdit={() => {
            setEditingAuthor(viewingAuthor);
            setViewingAuthor(null);
          }}
        />
      )}
    </div>
  );
};

// Author Card Component
interface AuthorCardProps {
  author: Author;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const AuthorCard: React.FC<AuthorCardProps> = ({
  author,
  onEdit,
  onView,
  onDelete,
  isDeleting,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {author.fullName}
          </h3>
          {author.bio && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {author.bio}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Added: {new Date(author.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={onView}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details
        </button>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit author"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete author"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Author Form Modal Component
interface AuthorFormModalProps {
  author: Author | null;
  onClose: () => void;
  onSubmit: (data: CreateAuthorRequest) => void;
  isLoading: boolean;
}

const AuthorFormModal: React.FC<AuthorFormModalProps> = ({
  author,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateAuthorRequest>({
    first_name: author?.first_name || '',
    last_name: author?.last_name || '',
    bio: author?.bio || '',
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
            {author ? 'Edit Author' : 'Add New Author'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biography
              </label>
              <textarea
                rows={4}
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about the author..."
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
                {isLoading ? 'Saving...' : author ? 'Update Author' : 'Add Author'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Author Details Modal Component
interface AuthorDetailsModalProps {
  author: Author;
  books: Book[];
  isLoading: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const AuthorDetailsModal: React.FC<AuthorDetailsModalProps> = ({
  author,
  books,
  isLoading,
  onClose,
  onEdit,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {author.fullName}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Author since {new Date(author.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit author"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Biography */}
            {author.bio && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Biography</h3>
                <p className="text-gray-700 leading-relaxed">{author.bio}</p>
              </div>
            )}

            {/* Books */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Books by this Author ({books.length})
              </h3>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : books.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {books.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      {book.cover_url && (
                        <img
                          src={book.cover_url}
                          alt={book.title}
                          className="w-16 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {book.title}
                        </h4>
                        {book.year && (
                          <p className="text-sm text-gray-500">
                            Published: {book.year}
                          </p>
                        )}
                        {book.category && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {book.category}
                          </span>
                        )}
                        <div className="mt-2">
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No books found for this author.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthorsManagement;