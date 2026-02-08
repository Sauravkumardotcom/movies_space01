import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Film, Clock, Music, List, Upload, Heart, Monitor, History, BarChart3, Search, Bell, User, Settings } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../store/auth';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
  { label: 'Movies', path: '/movies', icon: <Film className="w-5 h-5" /> },
  { label: 'Shorts', path: '/shorts', icon: <Clock className="w-5 h-5" /> },
  { label: 'Music', path: '/music', icon: <Music className="w-5 h-5" /> },
  { label: 'Playlists', path: '/playlists', icon: <List className="w-5 h-5" /> },
  { label: 'Uploads', path: '/uploads', icon: <Upload className="w-5 h-5" /> },
  { label: 'Favorites', path: '/favorites', icon: <Heart className="w-5 h-5" /> },
  { label: 'Watchlist', path: '/watchlist', icon: <Monitor className="w-5 h-5" /> },
  { label: 'History', path: '/history', icon: <History className="w-5 h-5" /> },
  { label: 'Stats', path: '/stats', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Search', path: '/search', icon: <Search className="w-5 h-5" /> },
  { label: 'Notifications', path: '/notifications', icon: <Bell className="w-5 h-5" /> },
  { label: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
];

const adminNavItems: NavItem[] = [...navItems, { label: 'Admin', path: '/admin', icon: <Settings className="w-5 h-5" /> }];

export const Navigation: React.FC = () => {
  const { tokens } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const items = user?.role === 'admin' ? adminNavItems : navItems;
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav
        style={{
          backgroundColor: tokens.colors.surface,
          borderTopColor: tokens.colors.border,
          boxShadow: tokens.shadows.lg,
        }}
        className="fixed bottom-0 left-0 right-0 md:hidden border-t"
      >
        <div className="flex justify-around h-20">
          {items.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                color: isActive(item.path)
                  ? tokens.colors.primary
                  : tokens.colors.textMuted,
              }}
              className="flex flex-col items-center justify-center flex-1 gap-1 transition-colors duration-200"
            >
              {typeof item.icon === 'string' ? <span className="text-2xl">{item.icon}</span> : item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside
        style={{
          backgroundColor: tokens.colors.surface,
          borderRightColor: tokens.colors.border,
        }}
        className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:flex md:flex-col md:border-r md:overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center gap-2 text-2xl font-bold" style={{ color: tokens.colors.primary }}>
            <Film className="w-8 h-8" />
            <span>Movies Space</span>
          </div>
        </div>

        <nav className="flex-1 px-4 pb-20">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                backgroundColor: isActive(item.path)
                  ? tokens.colors.primary + '20'
                  : 'transparent',
                color: isActive(item.path)
                  ? tokens.colors.primary
                  : tokens.colors.text,
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 hover:bg-opacity-50"
             >
              {typeof item.icon === 'string' ? <span className="text-xl">{item.icon}</span> : <span>{item.icon}</span>}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            backgroundColor: tokens.colors.surfaceSecondary,
            borderTopColor: tokens.colors.border,
            color: tokens.colors.textMuted,
          }}
          className="p-4 border-t text-sm"
        >
          <p className="font-medium">{user?.username}</p>
          <p>{user?.email}</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <header
        style={{
          backgroundColor: tokens.colors.surface,
          borderBottomColor: tokens.colors.border,
          boxShadow: tokens.shadows.md,
        }}
        className="md:hidden fixed top-0 left-0 right-0 h-16 border-b flex items-center justify-between px-4 z-40"
      >
        <Link to="/" className="flex items-center gap-2 text-lg font-bold" style={{ color: tokens.colors.primary }}>
          <Film className="w-6 h-6" />
          <span>Movies Space</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ color: tokens.colors.text }}
          className="text-2xl"
        >
          ⋯
        </button>
      </header>

      {/* Mobile Body Offset */}
      <div className="md:ml-64 pb-24 md:pb-0 pt-16 md:pt-0" />
    </>
  );
};
