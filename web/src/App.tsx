import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetail from './pages/BookDetail';
import Profile from './pages/Profile';
import MyBooks from './pages/MyBooks';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooksManagement from './pages/admin/AdminBooksManagement';
import AdminAuthorsManagement from './pages/admin/AdminAuthorsManagement';
import AdminUsersManagement from './pages/admin/AdminUsersManagement';
import AdminReservationsManagement from './pages/admin/AdminReservationsManagement';
import AdminLoansManagement from './pages/admin/AdminLoansManagement';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/books/:id" element={<BookDetail />} />

                {/* Protected Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-books"
                  element={
                    <ProtectedRoute>
                      <MyBooks />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/books"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminBooksManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/authors"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminAuthorsManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminUsersManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reservations"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminReservationsManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/loans"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLoansManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;