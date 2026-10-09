import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Box, Breadcrumbs, Button, Container, Divider, Grid, Link as MuiLink, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import ErrorMessage from '../../components/ErrorMessage'
import Loader from '../../components/Loader'
import PriceTag from '../../components/PriceTag'
import QuantityStepper from '../../components/QuantityStepper'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useFetch } from '../../hooks/useFetch'
import { LOW_STOCK_THRESHOLD, MAX_CART_QUANTITY } from '../../lib/constants'
import { notify } from '../../lib/notify'
import { selectUser } from '../auth/authSlice'
import { addToCart } from '../cart/cartSlice'
import Reviews from '../reviews/Reviews'
import { useWishlistToggle } from '../wishlist/useWishlistToggle'
import { fetchProduct } from './productApi'

function Gallery({ product }) {
  const images = Array.from(new Set([product.thumbnail, ...product.images]))
  const [active, setActive] = useState(0)

  useEffect(() => setActive(0), [product._id])

  return (
    <Stack spacing={2}>
      <Box sx={{ aspectRatio: '1 / 1', bgcolor: '#efede8', borderRadius: 2, overflow: 'hidden' }}>
        <Box component="img" src={images[active]} alt={product.title} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </Box>
      {images.length > 1 && (
        <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 0.5 }}>
          {images.map((image, index) => (
            <Box
              key={image}
              component="button"
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show image ${index + 1}`}
              sx={{
                flex: '0 0 72px',
                height: 72,
                p: 0,
                cursor: 'pointer',
                borderRadius: 1.5,
                overflow: 'hidden',
                bgcolor: '#efede8',
                border: 2,
                borderColor: index === active ? 'text.primary' : 'transparent',
              }}
            >
              <Box component="img" src={image} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  )
}

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const { data: product, error, loading, reload } = useFetch(() => fetchProduct(id), [id])
  const { saved, toggle } = useWishlistToggle(id)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  useDocumentTitle(product?.title)

  if (loading && !product) return <Loader />
  if (error?.status === 404) {
    return <EmptyState title="Product not found" message="It may have been removed." actionLabel="Back to shop" actionTo="/" />
  }
  if (error) {
    return (
      <Container sx={{ py: 5 }}>
        <ErrorMessage error={error} onRetry={reload} />
      </Container>
    )
  }

  const soldOut = product.stockQuantity === 0
  const maxQuantity = Math.min(MAX_CART_QUANTITY, product.stockQuantity)

  const add = async ({ checkout = false } = {}) => {
    setAdding(true)
    const done = await notify(dispatch(addToCart({ product: product._id, quantity })), checkout ? null : 'Added to cart')
    setAdding(false)
    if (done && checkout) navigate('/cart')
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" underline="hover" color="text.secondary">
          Shop
        </MuiLink>
        <MuiLink component={Link} to={`/?category=${product.category?._id}`} underline="hover" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
          {product.category?.name}
        </MuiLink>
        <Typography color="text.primary" noWrap sx={{ maxWidth: 240 }}>
          {product.title}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={{ xs: 3, md: 6 }}>
        <Grid item xs={12} md={6}>
          <Gallery product={product} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                {product.brand?.name}
              </Typography>
              <Typography variant="h3" component="h1">
                {product.title}
              </Typography>
            </Box>

            <PriceTag product={product} size="large" />

            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {product.description}
            </Typography>

            <Divider />

            {product.isDeleted ? (
              <Typography color="error">This product has been removed from the store.</Typography>
            ) : user.isAdmin ? (
              <Button component={Link} to={`/admin/products/${product._id}/edit`} variant="outlined" sx={{ alignSelf: 'flex-start' }}>
                Edit product
              </Button>
            ) : soldOut ? (
              <Typography color="error" sx={{ fontWeight: 600 }}>
                Out of stock
              </Typography>
            ) : (
              <>
                <Typography variant="body2" color={product.stockQuantity <= LOW_STOCK_THRESHOLD ? 'secondary' : 'text.secondary'}>
                  {product.stockQuantity <= LOW_STOCK_THRESHOLD ? `Only ${product.stockQuantity} left in stock` : 'In stock'}
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                  <QuantityStepper value={quantity} max={maxQuantity} onChange={setQuantity} />
                  <Button variant="contained" size="large" disabled={adding} onClick={() => add()}>
                    Add to cart
                  </Button>
                  <Button variant="outlined" size="large" disabled={adding} onClick={() => add({ checkout: true })}>
                    Buy now
                  </Button>
                </Stack>
              </>
            )}

            {!user.isAdmin && (
              <Button
                onClick={toggle}
                color="inherit"
                startIcon={saved ? <FavoriteIcon color="secondary" /> : <FavoriteBorderIcon />}
                sx={{ alignSelf: 'flex-start' }}
              >
                {saved ? 'Saved to wishlist' : 'Save to wishlist'}
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ my: 6 }} />
      <Reviews productId={product._id} />
    </Container>
  )
}
