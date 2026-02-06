/**
 * Design System - Theme and Design Tokens
 * Unified color, spacing, typography, and shadow system
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeTokens {
  colors: {
    // Backgrounds
    background: string;
    surface: string;
    surfaceSecondary: string;
    
    // Interactive
    primary: string;
    primaryHover: string;
    primaryActive: string;
    
    secondary: string;
    secondaryHover: string;
    
    // Status
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Text
    text: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    
    // UI Elements
    border: string;
    borderLight: string;
    divider: string;
    
    // Overlays
    overlay: string;
    overlayDim: string;
  };
  
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  
  typography: {
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  
  shadows: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  radius: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// Dark theme tokens (default)
export const darkThemeTokens: ThemeTokens = {
  colors: {
    background: '#0f172a', // slate-950
    surface: '#1e293b', // slate-900
    surfaceSecondary: '#334155', // slate-700
    
    primary: '#3b82f6', // blue-500
    primaryHover: '#2563eb', // blue-600
    primaryActive: '#1d4ed8', // blue-700
    
    secondary: '#8b5cf6', // violet-500
    secondaryHover: '#7c3aed', // violet-600
    
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
    info: '#06b6d4', // cyan-500
    
    text: '#f1f5f9', // slate-100
    textSecondary: '#cbd5e1', // slate-300
    textMuted: '#94a3b8', // slate-400
    textInverse: '#0f172a', // slate-950
    
    border: '#475569', // slate-600
    borderLight: '#334155', // slate-700
    divider: '#1e293b', // slate-900
    
    overlay: 'rgba(0, 0, 0, 0.3)',
    overlayDim: 'rgba(0, 0, 0, 0.8)',
  },
  
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '2.5rem', // 40px
    '3xl': '3rem', // 48px
  },
  
  typography: {
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.3)',
  },
  
  radius: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },
  
  transitions: {
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 350ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Light theme tokens
export const lightThemeTokens: ThemeTokens = {
  ...darkThemeTokens,
  colors: {
    ...darkThemeTokens.colors,
    background: '#ffffff', // white
    surface: '#f8fafc', // slate-50
    surfaceSecondary: '#f1f5f9', // slate-100
    
    primary: '#2563eb', // blue-600
    primaryHover: '#1d4ed8', // blue-700
    primaryActive: '#1e40af', // blue-800
    
    secondary: '#7c3aed', // violet-600
    secondaryHover: '#6d28d9', // violet-700
    
    text: '#1e293b', // slate-900
    textSecondary: '#475569', // slate-600
    textMuted: '#64748b', // slate-500
    textInverse: '#f1f5f9', // slate-100
    
    border: '#cbd5e1', // slate-300
    borderLight: '#e2e8f0', // slate-200
    divider: '#f1f5f9', // slate-100
    
    overlay: 'rgba(0, 0, 0, 0.2)',
    overlayDim: 'rgba(0, 0, 0, 0.7)',
  },
};
