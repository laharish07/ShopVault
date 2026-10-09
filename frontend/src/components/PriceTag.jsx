import { Chip, Stack, Typography } from '@mui/material'
import { discountOf, formatPrice } from '../lib/format'

export default function PriceTag({ product, size = 'medium' }) {
  const discount = discountOf(product)
  const large = size === 'large'

  return (
    <Stack direction="row" alignItems="baseline" spacing={1} flexWrap="wrap">
      <Typography variant={large ? 'h3' : 'h6'} component="span" sx={{ fontWeight: 700 }}>
        {formatPrice(product.finalPrice ?? product.price)}
      </Typography>
      {discount > 0 && (
        <>
          <Typography component="span" color="text.secondary" sx={{ textDecoration: 'line-through', fontSize: large ? '1.1rem' : '0.875rem' }}>
            {formatPrice(product.price)}
          </Typography>
          <Chip label={`${discount}% off`} size="small" color="secondary" variant="outlined" />
        </>
      )}
    </Stack>
  )
}
