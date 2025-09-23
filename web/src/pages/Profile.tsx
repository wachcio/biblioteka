import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMyReservations, useMyLoans, useCancelReservation } from '../hooks/useApi';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';

const Profile: React.FC = () => {
  const { user } = useAuth();
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
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

      {/* User Info */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="text-lg text-gray-900">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-lg text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="text-lg">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    user?.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Member since</dt>
              <dd className="text-lg text-gray-900">
                {user?.created_at ? formatDate(user.created_at) : 'Unknown'}
              </dd>
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
              My Reservations
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'loans'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Loans
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
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
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
                              className="text-red-600 hover:text-red-500 text-sm font-medium disabled:opacity-50"
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
                <div className="text-center py-8">
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
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
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
                            <span className={isOverdue(loan.due_date) ? 'text-red-600 font-medium' : ''}>
                              Due: {formatDate(loan.due_date)}
                            </span>
                            {loan.returned_at && (
                              <span>Returned: {formatDate(loan.returned_at)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              loan.status
                            )}`}
                          >
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
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

export default Profile;