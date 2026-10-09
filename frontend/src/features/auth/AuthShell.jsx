import { Box, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'

// Shared frame for the sign in / sign up / recovery screens.
export default function AuthShell({ title, subtitle, children, footer }) {
  useDocumentTitle(title)

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2, py: 6, bgcolor: 'background.default' }}>
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 420 }}>
        <Typography
          component={Link}
          to="/"
          variant="h5"
          sx={{ color: 'text.primary', textDecoration: 'none', fontWeight: 700, textAlign: 'center', letterSpacing: '-0.02em' }}
        >
          ShopVault
        </Typography>

        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
          {subtitle && (
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              {subtitle}
            </Typography>
          )}
          <Box sx={{ mt: 3 }}>{children}</Box>
        </Paper>

        {footer && (
          <Typography color="text.secondary" textAlign="center">
            {footer}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
