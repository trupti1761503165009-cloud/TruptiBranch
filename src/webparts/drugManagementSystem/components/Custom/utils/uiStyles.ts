/**
 * Consistent UI styling utilities for DMS components
 * Provides standard button, form, and badge styles across the application
 */

import type { IButtonStyles } from '@fluentui/react/lib/Button';

// Color palette
export const COLORS = {
  PRIMARY: '#1E88E5',
  PRIMARY_HOVER: '#1565C0',
  PRIMARY_ACTIVE: '#0D47A1',
  
  SUCCESS: '#43A047',
  SUCCESS_HOVER: '#388E3C',
  SUCCESS_ACTIVE: '#2E7D32',
  
  WARNING: '#FB8C00',
  WARNING_HOVER: '#F57C00',
  WARNING_ACTIVE: '#E65100',
  
  DANGER: '#E53935',
  DANGER_HOVER: '#D32F2F',
  DANGER_ACTIVE: '#C62828',
  
  SECONDARY: '#1565C0',
  TEXT_PRIMARY: '#424242',
  TEXT_LIGHT: '#666666',
  BG_LIGHT: '#F5F5F5',
  BORDER_COLOR: '#CCCCCC',
  FOCUS_SHADOW: '#1E88E5',
};

/**
 * Button style definitions
 */
export const buttonStyles = {
  primary: (): IButtonStyles => ({
    root: { 
      background: COLORS.PRIMARY, 
      borderColor: COLORS.PRIMARY,
      color: '#ffffff',
      fontSize: '13px',
      fontWeight: 500,
      padding: '6px 16px',
      height: '32px',
      border: '1px solid',
    },
    rootHovered: { 
      background: COLORS.PRIMARY_HOVER, 
      borderColor: COLORS.PRIMARY_HOVER,
      color: '#ffffff',
    },
    rootPressed: { 
      background: COLORS.PRIMARY_ACTIVE, 
      borderColor: COLORS.PRIMARY_ACTIVE,
      color: '#ffffff',
    },
    rootDisabled: {
      background: '#CCCCCC',
      borderColor: '#CCCCCC',
      color: '#666666',
    }
  }),

  secondary: (): IButtonStyles => ({
    root: { 
      background: '#ffffff', 
      borderColor: COLORS.BORDER_COLOR,
      color: COLORS.TEXT_PRIMARY,
      fontSize: '13px',
      fontWeight: 500,
      padding: '6px 16px',
      height: '32px',
      border: '1px solid',
    },
    rootHovered: { 
      background: COLORS.BG_LIGHT,
      borderColor: COLORS.PRIMARY,
      color: COLORS.PRIMARY,
    },
    rootPressed: { 
      background: '#EEEEEE',
      borderColor: COLORS.PRIMARY,
      color: COLORS.PRIMARY,
    },
  }),

  success: (): IButtonStyles => ({
    root: { 
      background: COLORS.SUCCESS, 
      borderColor: COLORS.SUCCESS,
      color: '#ffffff',
      fontSize: '13px',
      fontWeight: 500,
      padding: '6px 16px',
      height: '32px',
      border: '1px solid',
    },
    rootHovered: { 
      background: COLORS.SUCCESS_HOVER, 
      borderColor: COLORS.SUCCESS_HOVER,
      color: '#ffffff',
    },
    rootPressed: { 
      background: COLORS.SUCCESS_ACTIVE, 
      borderColor: COLORS.SUCCESS_ACTIVE,
      color: '#ffffff',
    },
  }),

  danger: (): IButtonStyles => ({
    root: { 
      background: COLORS.DANGER, 
      borderColor: COLORS.DANGER,
      color: '#ffffff',
      fontSize: '13px',
      fontWeight: 500,
      padding: '6px 16px',
      height: '32px',
      border: '1px solid',
    },
    rootHovered: { 
      background: COLORS.DANGER_HOVER, 
      borderColor: COLORS.DANGER_HOVER,
      color: '#ffffff',
    },
    rootPressed: { 
      background: COLORS.DANGER_ACTIVE, 
      borderColor: COLORS.DANGER_ACTIVE,
      color: '#ffffff',
    },
  }),

  warning: (): IButtonStyles => ({
    root: { 
      background: COLORS.WARNING, 
      borderColor: COLORS.WARNING,
      color: '#ffffff',
      fontSize: '13px',
      fontWeight: 500,
      padding: '6px 16px',
      height: '32px',
      border: '1px solid',
    },
    rootHovered: { 
      background: COLORS.WARNING_HOVER, 
      borderColor: COLORS.WARNING_HOVER,
      color: '#ffffff',
    },
    rootPressed: { 
      background: COLORS.WARNING_ACTIVE, 
      borderColor: COLORS.WARNING_ACTIVE,
      color: '#ffffff',
    },
  }),
};

/**
 * TextField/form field style definitions
 */
export const formFieldStyles = (): Record<string, any> => ({
  root: {
    marginBottom: 12,
  },
  fieldGroup: {
    borderColor: COLORS.BORDER_COLOR,
    selectors: {
      ':focus-within': {
        borderColor: COLORS.PRIMARY,
        boxShadow: `0 0 0 3px rgba(30, 136, 229, 0.1)`,
      },
    },
  },
});

/**
 * Get button className based on type - for HTML buttons
 */
export const getButtonClassName = (variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' = 'secondary'): string => {
  return `btn-${variant}`;
};

/**
 * Status badge styling
 */
export const statusBadgeStyles = (status?: string): Record<string, any> => {
  const baseStyle = {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  };

  const statusMap: Record<string, { background: string; color: string }> = {
    draft: { background: '#FFF3E0', color: '#E65100' },
    'pending-approval': { background: '#FCE4EC', color: '#C2185B' },
    'in-review': { background: '#E3F2FD', color: '#1565C0' },
    signed: { background: '#E8F5E9', color: '#388E3C' },
    final: { background: '#1B5E20', color: '#ffffff' },
    approved: { background: '#2E7D32', color: '#ffffff' },
    rejected: { background: '#C62828', color: '#ffffff' },
    default: { background: '#F5F5F5', color: '#666666' },
  };

  const statusStyle = statusMap[status?.toLowerCase() ?? 'default'] || statusMap.default;
  return { ...baseStyle, ...statusStyle };
};

/**
 * Modal styles
 */
export const modalStyles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    position: 'relative' as const,
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    maxWidth: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
};
