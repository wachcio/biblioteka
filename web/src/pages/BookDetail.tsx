import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBook, useCreateReservation } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isReserving, setIsReserving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { isAuthenticated } = useAuth();
  const { data: book, isLoading, error } = useBook(Number(id));
  const createReservation = useCreateReservation();

  // Clear alert after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleReserveBook = async () => {
    if (!book || !isAuthenticated) {
      setAlert({ type: 'error', message: 'Please log in to reserve books' });
      return;
    }

    setIsReserving(true);
    try {
      await createReservation.mutateAsync({ book_id: book.id });
      setAlert({ type: 'success', message: 'Book reserved successfully!' });
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to reserve book',
      });
    } finally {
      setIsReserving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'borrowed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'reserved':
        return 'Reserved';
      case 'borrowed':
        return 'Borrowed';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert type="error" title="Error loading book">
          {error?.message || 'Book not found'}
        </Alert>
        <div className="mt-4">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-500"
          >
            ← Back to catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-blue-600 hover:text-blue-500 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to catalog
        </button>
      </div>

      {alert && (
        <div className="mb-6">
          <Alert
            type={alert.type}
            onClose={() => setAlert(null)}
          >
            {alert.message}
          </Alert>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="lg:flex">
          {/* Book Cover */}
          <div className="lg:w-1/3">
            <div className="aspect-[3/4] bg-gray-200 relative">
              {book.cover_url ? (
                <img
                  src={book.cover_url}
                  alt={`Cover of ${book.title}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    book.status
                  )}`}
                >
                  {getStatusText(book.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Book Details */}
          <div className="lg:w-2/3 p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {book.title}
              </h1>

              {/* Authors */}
              {book.bookAuthors && book.bookAuthors.length > 0 && (
                <p className="text-xl text-gray-600 mb-4">
                  by {book.bookAuthors.map((ba) => ba.author.fullName).join(', ')}
                </p>
              )}

              {/* Category */}
              {book.category && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {book.category}
                  </span>
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {book.year && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Published Year</dt>
                  <dd className="text-lg text-gray-900">{book.year}</dd>
                </div>
              )}

              {book.isbn && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">ISBN</dt>
                  <dd className="text-lg text-gray-900">{book.isbn}</dd>
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="text-lg">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(
                      book.status
                    )}`}
                  >
                    {getStatusText(book.status)}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Added</dt>
                <dd className="text-lg text-gray-900">
                  {new Date(book.created_at).toLocaleDateString()}
                </dd>
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {book.status === 'available' && isAuthenticated && (
                <button
                  onClick={handleReserveBook}
                  disabled={isReserving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center"
                >
                  {isReserving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Reserving...
                    </>
                  ) : (
                    'Reserve Book'
                  )}
                </button>
              )}

              {book.status === 'available' && !isAuthenticated && (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Sign in to Reserve
                </button>
              )}

              {book.status !== 'available' && (
                <div className="bg-gray-100 text-gray-600 px-6 py-3 rounded-md font-medium">
                  {book.status === 'reserved' ? 'Currently Reserved' : 'Currently Borrowed'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;