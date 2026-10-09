import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Box, Button, Card, CardActionArea, CardContent, IconButton, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import PriceTag from '../../components/PriceTag'
import { LOW_STOCK_THRESHOLD } from '../../lib/constants'
import { notify } from '../../lib/notify'
import { addToCart } from '../cart/cartSlice'
import { useWishlistToggle } from '../wishlist/useWishlistToggle'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const { saved, toggle } = useWishlistToggle(product._id)
  const [adding, setAdding] = useState(false)
  const soldOut = product.stockQuantity === 0

  const add = async () => {
    setAdding(true)
    await notify(dispatch(addToCart({ product: product._id })), 'Added to cart')
    setAdding(false)
  }

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <IconButton
        onClick={toggle}
        aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        aria-pressed={saved}
        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}
        size="small"
      >
        {saved ? <FavoriteIcon fontSize="small" color="secondary" /> : <FavoriteBorderIcon fontSize="small" />}
      </IconButton>

      <CardActionArea component={Link} to={`/products/${product._id}`} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <Box sx={{ aspectRatio: '1 / 1', bgcolor: '#efede8', overflow: 'hidden' }}>
          <Box
            component="img"
            src={product.thumbnail}
            alt={product.title}
            loading="lazy"
            sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: soldOut ? 0.5 : 1 }}
          />
        </Box>
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {product.brand?.name}
          </Typography>
          <Typography sx={{ fontWeight: 600, mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.title}
          </Typography>
          <PriceTag product={product} />
        </CardContent>
      </CardActionArea>

      <Stack sx={{ p: 2, pt: 0 }} spacing={1}>
        {!soldOut && product.stockQuantity <= LOW_STOCK_THRESHOLD && (
          <Typography variant="caption" color="secondary">
            Only {product.stockQuantity} left
          </Typography>
        )}
        <Button variant="outlined" color="primary" fullWidth disabled={soldOut || adding} onClick={add}>
          {soldOut ? 'Out of stock' : adding ? 'Adding...' : 'Add to cart'}
        </Button>
      </Stack>
    </Card>
  )
}
