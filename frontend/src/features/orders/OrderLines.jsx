import { Box, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../lib/format'
import { lineOf } from './orderUtils'

export default function OrderLines({ items, compact = false }) {
  return (
    <Stack spacing={compact ? 1.5 : 2.5}>
      {items.map((item) => {
        const line = lineOf(item)
        const size = compact ? 56 : 72

        return (
          <Stack key={line.id} direction="row" spacing={2} alignItems="center">
            <Box
              component={Link}
              to={`/products/${line.id}`}
              sx={{ flex: `0 0 ${size}px`, height: size, borderRadius: 1.5, overflow: 'hidden', bgcolor: '#efede8' }}
            >
              <Box component="img" src={line.image} alt={line.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 600 }}>
                {line.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {line.brand ? `${line.brand} · ` : ''}Qty {line.quantity}
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 600 }}>{formatPrice(line.unitPrice * line.quantity)}</Typography>
          </Stack>
        )
      })}
    </Stack>
  )
}
