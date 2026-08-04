import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/shared';
import { LoginPage } from './pages/auth/LoginPage';
import { AdminDashboardPage } from './pages/admin/DashboardPage';
import { ManageRoomsPage } from './pages/admin/ManageRoomsPage';
import { ApprovalsPage } from './pages/admin/ApprovalsPage';
import { DosenDashboardPage } from './pages/dosen/DashboardPage';
import { DosenNewBookingPage } from './pages/dosen/NewBookingPage';
import { DosenHistoryPage } from './pages/dosen/HistoryPage';
import { LoadingPage } from './components/shared';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <LoadingPage />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dosen'} replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <LoadingPage />;
  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dosen'} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AppLayout>
              <AdminDashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rooms"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AppLayout>
              <ManageRoomsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AppLayout>
              <ApprovalsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Dosen routes */}
      <Route
        path="/dosen"
        element={
          <ProtectedRoute roles={['DOSEN']}>
            <AppLayout>
              <DosenDashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dosen/new"
        element={
          <ProtectedRoute roles={['DOSEN']}>
            <AppLayout>
              <DosenNewBookingPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dosen/history"
        element={
          <ProtectedRoute roles={['DOSEN']}>
            <AppLayout>
              <DosenHistoryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}