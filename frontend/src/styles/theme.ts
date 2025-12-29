/**
 * Business Guardian AI - JD.com Inspired Color Theme
 * Based on JD.com's brand colors and e-commerce aesthetics
 */

export const theme = {
  // Primary Brand Colors (JD.com Red)
  primary: {
    main: '#E4393C',      // JD Red - Primary brand color
    light: '#FF6B6E',     // Lighter red for hovers
    dark: '#C41D1D',      // Darker red for pressed states
    contrast: '#FFFFFF',  // White text on red
  },

  // Secondary Colors (Professional Business)
  secondary: {
    main: '#2C3E50',      // Dark blue-gray - Professional
    light: '#34495E',     // Lighter gray-blue
    dark: '#1A252F',      // Almost black
    contrast: '#FFFFFF',
  },

  // Accent Colors
  accent: {
    gold: '#F39C12',      // Premium/VIP features
    blue: '#3498DB',      // Information, links
    purple: '#9B59B6',    // Special features
  },

  // Alert/Status Colors
  status: {
    success: '#27AE60',   // Green - Success, safe
    warning: '#F39C12',   // Orange - Warning, medium risk
    error: '#E74C3C',     // Red - Error, critical alert
    info: '#3498DB',      // Blue - Information
  },

  // Severity Levels (for fraud alerts)
  severity: {
    critical: {
      bg: '#FFEBEE',
      border: '#E53935',
      text: '#B71C1C',
      icon: '#D32F2F',
    },
    high: {
      bg: '#FFF3E0',
      border: '#FB8C00',
      text: '#E65100',
      icon: '#F57C00',
    },
    medium: {
      bg: '#FFF9C4',
      border: '#FDD835',
      text: '#F57F17',
      icon: '#FBC02D',
    },
    low: {
      bg: '#E3F2FD',
      border: '#42A5F5',
      text: '#1565C0',
      icon: '#1976D2',
    },
  },

  // Background Colors
  background: {
    default: '#F5F5F5',   // Light gray - Main background
    paper: '#FFFFFF',     // White - Card/panel background
    dark: '#1A1A1A',      // Dark mode background
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay
  },

  // Text Colors
  text: {
    primary: '#212121',   // Main text - Almost black
    secondary: '#757575', // Secondary text - Gray
    disabled: '#BDBDBD',  // Disabled text
    hint: '#9E9E9E',      // Hint text
    white: '#FFFFFF',     // White text
  },

  // Border Colors
  border: {
    light: '#E0E0E0',     // Light gray borders
    main: '#BDBDBD',      // Default borders
    dark: '#757575',      // Dark borders
    focus: '#E4393C',     // Focus state (primary red)
  },

  // Chart Colors (for dashboard visualizations)
  chart: {
    red: '#E4393C',
    orange: '#FF6B35',
    yellow: '#F7B731',
    green: '#5FBB97',
    blue: '#4A90E2',
    purple: '#9B59B6',
    pink: '#E91E63',
    teal: '#1ABC9C',
  },

  // Gradient Colors (for modern UI effects)
  gradients: {
    primary: 'linear-gradient(135deg, #E4393C 0%, #C41D1D 100%)',
    success: 'linear-gradient(135deg, #27AE60 0%, #1E8449 100%)',
    danger: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)',
    info: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
    dark: 'linear-gradient(135deg, #2C3E50 0%, #1A252F 100%)',
  },

  // Shadow Definitions
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // Typography
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'Monaco, Consolas, "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // Spacing (for consistent margins/paddings)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',   // Fully rounded
  },

  // Z-index Layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Breakpoints (responsive design)
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// CSS Variables export for use in CSS files
export const cssVariables = `
:root {
  /* Primary Colors */
  --color-primary-main: ${theme.primary.main};
  --color-primary-light: ${theme.primary.light};
  --color-primary-dark: ${theme.primary.dark};

  /* Background */
  --color-bg-default: ${theme.background.default};
  --color-bg-paper: ${theme.background.paper};

  /* Text */
  --color-text-primary: ${theme.text.primary};
  --color-text-secondary: ${theme.text.secondary};

  /* Status */
  --color-success: ${theme.status.success};
  --color-warning: ${theme.status.warning};
  --color-error: ${theme.status.error};
  --color-info: ${theme.status.info};

  /* Shadows */
  --shadow-sm: ${theme.shadows.sm};
  --shadow-md: ${theme.shadows.md};
  --shadow-lg: ${theme.shadows.lg};

  /* Spacing */
  --spacing-sm: ${theme.spacing.sm};
  --spacing-md: ${theme.spacing.md};
  --spacing-lg: ${theme.spacing.lg};

  /* Border Radius */
  --radius-md: ${theme.borderRadius.md};
  --radius-lg: ${theme.borderRadius.lg};
}
`;

export default theme;
