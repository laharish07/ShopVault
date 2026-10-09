import { Divider, Stack, Typography } from '@mui/material'
import { formatPrice } from '../../lib/format'

function Row({ label, value, strong }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography color={strong ? 'text.primary' : 'text.secondary'} sx={{ fontWeight: strong ? 700 : 400 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: strong ? 700 : 500 }}>{value}</Typography>
    </Stack>
  )
}

// Price breakdown used by the cart, checkout and order screens. Older orders may not have
// a breakdown stored, so every optional line is skipped when the value is missing.
export default function OrderSummary({ summary }) {
  return (
    <Stack spacing={1.25}>
      {summary.subtotal !== undefined && <Row label="Subtotal" value={formatPrice(summary.subtotal)} />}
      {summary.shipping !== undefined && <Row label="Shipping" value={formatPrice(summary.shipping)} />}
      {summary.tax !== undefined && <Row label="Taxes" value={formatPrice(summary.tax)} />}
      <Divider />
      <Row label="Total" value={formatPrice(summary.total)} strong />
    </Stack>
  )
}
