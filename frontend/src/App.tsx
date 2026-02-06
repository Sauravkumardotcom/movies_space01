import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useAuth } from './store/auth';
import { ThemeProvider, useTheme } from './theme/ThemeProvider';
import ProtectedRoute from './components/ProtectedRoute';
import { Navigation } from './components/navigation/Navigation';
import { Container, Flex, VStack, Section, Spacer } from './components/layout/LayoutPrimitives';
import { Button } from './components/common/FormElements';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import MusicPage from './pages/MusicPage';
import PlaylistsPage from './pages/PlaylistsPage';
import UploadsPage from './pages/UploadsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { HistoryPage } from './pages/HistoryPage';
import { StatsPage } from './pages/StatsPage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';
import SocialPage from './pages/SocialPage';

// ============================================
// HOME PAGE
// ============================================

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { tokens } = useTheme();

  if (!isAuthenticated) {
    return (
      <div
        style={{ backgroundColor: tokens.colors.background }}
        className="min-h-screen flex items-center justify-center px-4"
      >
        <Container maxWidth="md">
          <VStack align="center" justify="center" className="min-h-screen gap-8">
            <div className="text-center">
              <h1 style={{ color: tokens.colors.text }} className="text-5xl font-bold mb-4">
                🎬 Movies Space
              </h1>
              <p style={{ color: tokens.colors.textMuted }} className="text-xl mb-8">
                Your ultimate entertainment hub for movies, music, and more
              </p>
            </div>

            <Flex direction="row" gap="md" wrap className="justify-center w-full">
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '/login'}
              >
                Sign In
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => window.location.href = '/signup'}
              >
                Create Account
              </Button>
            </Flex>
          </VStack>
        </Container>
      </div>
    );
  }

  return (
    <Container maxWidth="lg">
      <Section title={`Welcome back, ${user?.username}!`} subtitle="Ready to explore your entertainment?">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Music Card */}
          <div
            onClick={() => window.location.href = '/music'}
            style={{
              backgroundColor: tokens.colors.surface,
              boxShadow: tokens.shadows.md,
            }}
            className="p-6 rounded-lg cursor-pointer hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="text-4xl mb-4">🎵</div>
            <h3 style={{ color: tokens.colors.text }} className="text-xl font-bold mb-2">
              Discover Music
            </h3>
            <p style={{ color: tokens.colors.textMuted }}>
              Explore millions of songs, create playlists, and share your favorites
            </p>
          </div>

          {/* Playlists Card */}
          <div
            onClick={() => window.location.href = '/playlists'}
            style={{
              backgroundColor: tokens.colors.surface,
              boxShadow: tokens.shadows.md,
            }}
            className="p-6 rounded-lg cursor-pointer hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 style={{ color: tokens.colors.text }} className="text-xl font-bold mb-2">
              Your Playlists
            </h3>
            <p style={{ color: tokens.colors.textMuted }}>
              Organize your favorite tracks and manage your music collection
            </p>
          </div>

          {/* Uploads Card */}
          <div
            onClick={() => window.location.href = '/uploads'}
            style={{
              backgroundColor: tokens.colors.surface,
              boxShadow: tokens.shadows.md,
            }}
            className="p-6 rounded-lg cursor-pointer hover:shadow-lg transition-all hover:scale-105"
          >
            <div className="text-4xl mb-4">📤</div>
            <h3 style={{ color: tokens.colors.text }} className="text-xl font-bold mb-2">
              Your Uploads
            </h3>
            <p style={{ color: tokens.colors.textMuted }}>
              Upload your own audio files and manage your media library
            </p>
          </div>
        </div>
      </Section>

      <Spacer size="lg" />
    </Container>
  );
};

// ============================================
// APP CONTENT
// ============================================

function AppContent(): JSX.Element {
  const { isAuthenticated, setUser } = useAuth();
  const { tokens } = useTheme();

  // Initialize user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to restore user session:', err);
      }
    }
  }, [setUser]);

  return (
    <div style={{ backgroundColor: tokens.colors.background, color: tokens.colors.text }}>
      <Navigation />

      <main className="min-h-screen transition-colors duration-300">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/music"
            element={
              <ProtectedRoute>
                <MusicPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <PlaylistsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/uploads"
            element={
              <ProtectedRoute>
                <UploadsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <WatchlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <StatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/social/:userId"
            element={
              <ProtectedRoute>
                <SocialPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// ============================================
// MAIN APP WITH PROVIDERS
// ============================================

export function App(): JSX.Element {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
