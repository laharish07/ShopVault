import { createTheme } from '@mui/material/styles'

const ink = '#1b1b1b'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: ink, contrastText: '#ffffff' },
    secondary: { main: '#b54a2c' },
    error: { main: '#c0392b' },
    success: { main: '#2e7d4f' },
    background: { default: '#f7f6f3', paper: '#ffffff' },
    text: { primary: ink, secondary: '#66655f' },
    divider: '#e4e2dc',
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontSize: '1.375rem', fontWeight: 600 },
    h5: { fontSize: '1.125rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { WebkitFontSmoothing: 'antialiased' },
        'img, svg': { display: 'block' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 8, paddingInline: 20 } },
    },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiTextField: { defaultProps: { variant: 'outlined', size: 'medium' } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiAppBar: { defaultProps: { elevation: 0, color: 'inherit' } },
  },
})

export default theme
