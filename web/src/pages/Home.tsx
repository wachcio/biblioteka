import React, { useState, useEffect } from 'react';
import { useBooks, useCreateReservation } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import BookCard from '../components/BookCard';
import SearchFilters from '../components/SearchFilters';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import Pagination from '../components/ui/Pagination';
import type { SearchParams } from '../types';

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    limit: 12,
  });
  const [reservingBookId, setReservingBookId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { isAuthenticated } = useAuth();
  const { data: booksData, isLoading, error } = useBooks(searchParams);
  const createReservation = useCreateReservation();

  // Clear alert after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleSearch = (search: string) => {
    setSearchParams({
      ...searchParams,
      search: search || undefined,
      page: 1,
    });
  };

  const handleCategoryFilter = (category: string) => {
    setSearchParams({
      ...searchParams,
      category: category || undefined,
      page: 1,
    });
  };

  const handleStatusFilter = (status: string) => {
    setSearchParams({
      ...searchParams,
      status: status || undefined,
      page: 1,
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams({
      ...searchParams,
      page,
    });
  };

  const handleReserveBook = async (bookId: number) => {
    if (!isAuthenticated) {
      setAlert({ type: 'error', message: 'Please log in to reserve books' });
      return;
    }

    setReservingBookId(bookId);
    try {
      await createReservation.mutateAsync({ book_id: bookId });
      setAlert({ type: 'success', message: 'Book reserved successfully!' });
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to reserve book',
      });
    } finally {
      setReservingBookId(null);
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert type="error" title="Error loading books">
          {error.message || 'Failed to load books'}
        </Alert>
      </div>
    );
  }

  const totalPages = booksData ? Math.ceil(booksData.total / (searchParams.limit || 12)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Book Catalog</h1>

        {alert && (
          <div className="mb-4">
            <Alert
              type={alert.type}
              onClose={() => setAlert(null)}
            >
              {alert.message}
            </Alert>
          </div>
        )}

        {/* Search and Filters */}
        <SearchFilters
          onSearchChange={handleSearch}
          onCategoryChange={handleCategoryFilter}
          onStatusChange={handleStatusFilter}
          onSortChange={() => setSearchParams({ ...searchParams, page: 1 })}
        />

        {/* Results count */}
        {booksData && (
          <p className="text-sm text-gray-600">
            Showing {booksData.books.length} of {booksData.total} books
          </p>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Books grid */}
      {booksData && booksData.books.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {booksData.books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onReserve={isAuthenticated ? handleReserveBook : undefined}
                isReserving={reservingBookId === book.id}
                showActions={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={searchParams.page || 1}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {booksData && booksData.books.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;