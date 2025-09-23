import React from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  onReserve?: (bookId: number) => void;
  isReserving?: boolean;
  showActions?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onReserve,
  isReserving = false,
  showActions = true
}) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Book Cover */}
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
              className="w-16 h-16 text-gray-400"
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
        <div className="absolute top-2 right-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              book.status
            )}`}
          >
            {getStatusText(book.status)}
          </span>
        </div>
      </div>

      {/* Book Details */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            <Link
              to={`/books/${book.id}`}
              className="hover:text-blue-600 transition-colors"
            >
              {book.title}
            </Link>
          </h3>
        </div>

        {/* Authors */}
        {book.bookAuthors && book.bookAuthors.length > 0 && (
          <div className="mb-2">
            <p className="text-sm text-gray-600">
              by{' '}
              {book.bookAuthors
                .map((ba) => ba.author.fullName)
                .join(', ')}
            </p>
          </div>
        )}

        {/* Category */}
        {book.category && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
              {book.category}
            </span>
          </div>
        )}

        {/* Year and ISBN */}
        <div className="text-xs text-gray-500 mb-3">
          {book.year && <span>Published: {book.year}</span>}
          {book.isbn && book.year && <span> • </span>}
          {book.isbn && <span>ISBN: {book.isbn}</span>}
        </div>

        {/* Description */}
        {book.description && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {book.description}
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Link
              to={`/books/${book.id}`}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium text-center transition-colors"
            >
              View Details
            </Link>

            {book.status === 'available' && onReserve && (
              <button
                onClick={() => onReserve(book.id)}
                disabled={isReserving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {isReserving ? 'Reserving...' : 'Reserve'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;