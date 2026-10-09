import { Button, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

export default function EmptyState({ title, message, actionLabel, actionTo, onAction }) {
  return (
    <Stack alignItems="center" spacing={1.5} sx={{ py: 8, px: 2, textAlign: 'center' }}>
      <Typography variant="h4">{title}</Typography>
      {message && (
        <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
          {message}
        </Typography>
      )}
      {actionLabel && (
        <Button variant="contained" sx={{ mt: 1 }} {...(actionTo ? { component: Link, to: actionTo } : { onClick: onAction })}>
          {actionLabel}
        </Button>
      )}
    </Stack>
  )
}
