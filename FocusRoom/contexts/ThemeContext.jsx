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
            main: '#3B82F6', 
            light: '#60A5FA',
            dark: '#2563EB',
          },
          warning: {
            main: '#F97316', // Kinetic Orange for Primary Actions
          },
          background: {
            default: mode === 'light' ? '#F8FAFC' : '#0A0F1E', // Deep space blue for dark
            paper: mode === 'light' ? '#ffffff' : '#111827',
          },
          text: {
            primary: mode === 'light' ? '#0F172A' : '#F8FAFC',
            secondary: mode === 'light' ? '#64748B' : '#94A3B8',
          },
          divider: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
        },
        typography: {
          fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
          h1: { fontWeight: 800, letterSpacing: '-0.04em' },
          h2: { fontWeight: 800, letterSpacing: '-0.03em' },
          h3: { fontWeight: 800, letterSpacing: '-0.02em' },
          h4: { fontWeight: 700, letterSpacing: '-0.01em' },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' },
          button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.02em' },
          overline: { fontWeight: 800, letterSpacing: '0.2em', fontFamily: '"Space Mono", monospace' },
          caption: { fontFamily: '"Space Mono", monospace', letterSpacing: '0.05em' },
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
