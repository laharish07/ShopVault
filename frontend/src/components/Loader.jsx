import { Box, CircularProgress } from '@mui/material'

export default function Loader({ fullPage = false }) {
  return (
    <Box
      role="status"
      aria-label="Loading"
      sx={{ display: 'grid', placeItems: 'center', minHeight: fullPage ? '100vh' : 240, width: '100%' }}
    >
      <CircularProgress size={28} color="primary" />
    </Box>
  )
}
