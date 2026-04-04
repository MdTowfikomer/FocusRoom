import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme as muiCreateTheme } from '@mui/material/styles';
import { ColorModeContext } from './ColorModeContext';

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode || 'dark';
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('theme-mode', newMode);
          document.documentElement.setAttribute('data-theme', newMode);
          return newMode;
        });
      },
    }),
    [],
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      muiCreateTheme({
        palette: {
          mode,
          primary: {
            main: '#3B82F6', // Matching App.css --primary
            light: '#60A5FA',
            dark: '#2563EB',
          },
          secondary: {
            main: '#7C3AED', // Matching App.css --accent
          },
          background: {
            default: mode === 'light' ? '#F8FAFC' : '#0F172A',
            paper: mode === 'light' ? '#ffffff' : '#1E293B',
          },
          text: {
            primary: mode === 'light' ? '#0F172A' : '#F1F5F9',
            secondary: mode === 'light' ? '#64748B' : '#94A3B8',
          },
        },
        typography: {
          fontFamily: '"Plus Jakarta Sans", "Inter", "system-ui", sans-serif',
          h1: { fontWeight: 800, letterSpacing: '-0.02em' },
          h2: { fontWeight: 800, letterSpacing: '-0.02em' },
          h3: { fontWeight: 700, letterSpacing: '-0.01em' },
          h4: { fontWeight: 700, letterSpacing: '-0.01em' },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.75rem' },
          button: { textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' },
          caption: { fontFamily: 'monospace', letterSpacing: '0.02em' },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: '8px 16px',
              },
              containedPrimary: {
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.35)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
