import { Box, Container, Stack, Typography } from '@mui/material'

export default function PageContainer({ title, subtitle, actions, maxWidth = 'lg', children }) {
  return (
    <Container maxWidth={maxWidth} sx={{ py: { xs: 3, md: 5 } }}>
      {title && (
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h3" component="h1">
              {title}
            </Typography>
            {subtitle && (
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions}
        </Stack>
      )}
      {children}
    </Container>
  )
}
