import { Alert, Box, Button, Divider, Grid, IconButton, Paper, Stack, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import Loader from '../../components/Loader'
import PageContainer from '../../components/PageContainer'
import QuantityStepper from '../../components/QuantityStepper'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { MAX_CART_QUANTITY } from '../../lib/constants'
import { formatPrice } from '../../lib/format'
import { notify } from '../../lib/notify'
import OrderSummary from '../orders/OrderSummary'
import { removeCartItem, selectCartItems, selectCartReady, selectCartSummary, updateCartItem } from './cartSlice'

const isUnavailable = (item) => item.product.isDeleted || item.product.stockQuantity < 1
const exceedsStock = (item) => !isUnavailable(item) && item.quantity > item.product.stockQuantity

function CartLine({ item }) {
  const dispatch = useDispatch()
  const { product, quantity } = item
  const unavailable = isUnavailable(item)

  const change = (next) => notify(dispatch(updateCartItem({ id: item._id, quantity: next })))
  const remove = () => notify(dispatch(removeCartItem(item._id)), 'Removed from cart')

  return (
    <Stack direction="row" spacing={2} sx={{ py: 2.5 }}>
      <Box
        component={Link}
        to={`/products/${product._id}`}
        sx={{ flex: '0 0 96px', height: 96, bgcolor: '#efede8', borderRadius: 2, overflow: 'hidden' }}
      >
        <Box component="img" src={product.thumbnail} alt={product.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: unavailable ? 0.45 : 1 }} />
      </Box>

      <Stack sx={{ flex: 1, minWidth: 0 }} spacing={1}>
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {product.brand?.name}
            </Typography>
            <Typography component={Link} to={`/products/${product._id}`} sx={{ display: 'block', fontWeight: 600, color: 'inherit', textDecoration: 'none' }}>
              {product.title}
            </Typography>
          </Box>
          <IconButton aria-label={`Remove ${product.title}`} size="small" onClick={remove} sx={{ alignSelf: 'flex-start' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        {unavailable ? (
          <Typography variant="body2" color="error">
            No longer available. Remove it to continue.
          </Typography>
        ) : (
          <>
            {exceedsStock(item) && (
              <Typography variant="body2" color="error">
                Only {product.stockQuantity} in stock. Lower the quantity to continue.
              </Typography>
            )}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <QuantityStepper value={quantity} max={Math.min(MAX_CART_QUANTITY, product.stockQuantity)} onChange={change} />
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontWeight: 700 }}>{formatPrice(product.finalPrice * quantity)}</Typography>
                {quantity > 1 && (
                  <Typography variant="caption" color="text.secondary">
                    {formatPrice(product.finalPrice)} each
                  </Typography>
                )}
              </Box>
            </Stack>
          </>
        )}
      </Stack>
    </Stack>
  )
}

export default function CartPage() {
  useDocumentTitle('Your cart')
  const navigate = useNavigate()
  const items = useSelector(selectCartItems)
  const summary = useSelector(selectCartSummary)
  const ready = useSelector(selectCartReady)

  if (!ready) return <Loader />

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        message="Find something you like and it will show up here."
        actionLabel="Browse products"
        actionTo="/"
      />
    )
  }

  const blocked = items.some((item) => isUnavailable(item) || exceedsStock(item))

  return (
    <PageContainer title="Your cart" subtitle={`${items.length} ${items.length === 1 ? 'item' : 'items'}`}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Divider />
          <Stack divider={<Divider flexItem />}>
            {items.map((item) => (
              <CartLine key={item._id} item={item} />
            ))}
          </Stack>
          <Divider />
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, position: { md: 'sticky' }, top: { md: 88 } }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Order summary
            </Typography>
            <OrderSummary summary={summary} />
            {blocked && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Update the highlighted items to continue.
              </Alert>
            )}
            <Button variant="contained" size="large" fullWidth sx={{ mt: 3 }} disabled={blocked} onClick={() => navigate('/checkout')}>
              Go to checkout
            </Button>
            <Button component={Link} to="/" color="inherit" fullWidth sx={{ mt: 1 }}>
              Continue shopping
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  )
}
