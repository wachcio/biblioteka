import React, { useState } from 'react';
import { useMyReservations, useMyLoans, useCancelReservation } from '../hooks/useApi';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';

const MyBooks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'loans'>('reservations');
  const [cancellingReservation, setCancellingReservation] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: reservations, isLoading: reservationsLoading } = useMyReservations();
  const { data: loans, isLoading: loansLoading } = useMyLoans();
  const cancelReservation = useCancelReservation();

  const handleCancelReservation = async (reservationId: number) => {
    setCancellingReservation(reservationId);
    try {
      await cancelReservation.mutateAsync(reservationId);
      setAlert({ type: 'success', message: 'Reservation cancelled successfully' });
    } catch (error: any) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to cancel reservation',
      });
    } finally {
      setCancellingReservation(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'converted':
        return 'bg-blue-100 text-blue-800';
      case 'returned':
        return 'bg-gray-100 text-gray-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDateString: string) => {
    return new Date(dueDateString) < new Date();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Books</h1>
        <p className="mt-2 text-gray-600">
          Manage your book reservations and loans
        </p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3a4 4 0 118 0v4M3 21h18v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Reservations</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reservations?.filter(r => r.status === 'active').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Current Loans</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loans?.filter(l => l.status === 'active').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue Books</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loans?.filter(l => l.status === 'overdue' || (l.status === 'active' && isOverdue(l.due_date))).length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'reservations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reservations ({reservations?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'loans'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Loans ({loans?.length || 0})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <div>
              {reservationsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : reservations && reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start space-x-4">
                            {/* Book Cover */}
                            <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0">
                              {reservation.book.cover_url ? (
                                <img
                                  src={reservation.book.cover_url}
                                  alt={reservation.book.title}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg
                                    className="w-6 h-6 text-gray-400"
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
                            </div>

                            {/* Book Details */}
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">
                                {reservation.book.title}
                              </h3>
                              {reservation.book.bookAuthors && (
                                <p className="text-sm text-gray-600 mt-1">
                                  by {reservation.book.bookAuthors.map(ba => ba.author.fullName).join(', ')}
                                </p>
                              )}
                              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                <span>Reserved: {formatDate(reservation.reserved_at)}</span>
                                {reservation.expires_at && (
                                  <span>Expires: {formatDate(reservation.expires_at)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              reservation.status
                            )}`}
                          >
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          </span>
                          {reservation.status === 'active' && (
                            <button
                              onClick={() => handleCancelReservation(reservation.id)}
                              disabled={cancellingReservation === reservation.id}
                              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium disabled:opacity-50"
                            >
                              {cancellingReservation === reservation.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
                      d="M8 7V3a4 4 0 118 0v4M3 21h18v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reservations</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't reserved any books yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Loans Tab */}
          {activeTab === 'loans' && (
            <div>
              {loansLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : loans && loans.length > 0 ? (
                <div className="space-y-4">
                  {loans.map((loan) => (
                    <div
                      key={loan.id}
                      className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start space-x-4">
                            {/* Book Cover */}
                            <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0">
                              {loan.book.cover_url ? (
                                <img
                                  src={loan.book.cover_url}
                                  alt={loan.book.title}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg
                                    className="w-6 h-6 text-gray-400"
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
                            </div>

                            {/* Book Details */}
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900">
                                {loan.book.title}
                              </h3>
                              {loan.book.bookAuthors && (
                                <p className="text-sm text-gray-600 mt-1">
                                  by {loan.book.bookAuthors.map(ba => ba.author.fullName).join(', ')}
                                </p>
                              )}
                              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                <span>Borrowed: {formatDate(loan.borrowed_at)}</span>
                                <span className={isOverdue(loan.due_date) && loan.status === 'active' ? 'text-red-600 font-medium' : ''}>
                                  Due: {formatDate(loan.due_date)}
                                </span>
                                {loan.returned_at && (
                                  <span>Returned: {formatDate(loan.returned_at)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              isOverdue(loan.due_date) && loan.status === 'active' ? 'overdue' : loan.status
                            )}`}
                          >
                            {isOverdue(loan.due_date) && loan.status === 'active'
                              ? 'Overdue'
                              : loan.status.charAt(0).toUpperCase() + loan.status.slice(1)
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
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
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No loans</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven't borrowed any books yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBooks;