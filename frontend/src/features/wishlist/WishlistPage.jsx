import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Box, Button, Grid, IconButton, Paper, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import Loader from '../../components/Loader'
import PageContainer from '../../components/PageContainer'
import PriceTag from '../../components/PriceTag'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { notify } from '../../lib/notify'
import { addToCart } from '../cart/cartSlice'
import { removeFromWishlist, selectWishlistItems, selectWishlistReady, updateWishlistNote } from './wishlistSlice'

function WishlistItem({ item }) {
  const dispatch = useDispatch()
  const { product } = item
  const [note, setNote] = useState(item.note || '')
  const soldOut = product.stockQuantity === 0

  useEffect(() => setNote(item.note || ''), [item.note])

  const saveNote = () => {
    if (note.trim() !== (item.note || '')) notify(dispatch(updateWishlistNote({ id: item._id, note })), 'Note saved')
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Stack spacing={2} sx={{ height: '100%' }}>
        <Stack direction="row" spacing={2}>
          <Box component={Link} to={`/products/${product._id}`} sx={{ flex: '0 0 88px', height: 88, borderRadius: 1.5, overflow: 'hidden', bgcolor: '#efede8' }}>
            <Box component="img" src={product.thumbnail} alt={product.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {product.brand?.name}
            </Typography>
            <Typography component={Link} to={`/products/${product._id}`} sx={{ display: 'block', fontWeight: 600, color: 'inherit', textDecoration: 'none' }}>
              {product.title}
            </Typography>
            <PriceTag product={product} />
          </Box>
          <IconButton
            size="small"
            aria-label={`Remove ${product.title} from wishlist`}
            sx={{ alignSelf: 'flex-start' }}
            onClick={() => notify(dispatch(removeFromWishlist(item._id)), 'Removed from wishlist')}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>

        <TextField
          size="small"
          label="Note to self"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onBlur={saveNote}
          inputProps={{ maxLength: 300 }}
        />

        <Button
          variant="outlined"
          disabled={soldOut}
          sx={{ mt: 'auto' }}
          onClick={() => notify(dispatch(addToCart({ product: product._id })), 'Added to cart')}
        >
          {soldOut ? 'Out of stock' : 'Add to cart'}
        </Button>
      </Stack>
    </Paper>
  )
}

export default function WishlistPage() {
  useDocumentTitle('Wishlist')
  const items = useSelector(selectWishlistItems)
  const ready = useSelector(selectWishlistReady)

  if (!ready) return <Loader />

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        message="Tap the heart on any product to save it for later."
        actionLabel="Browse products"
        actionTo="/"
      />
    )
  }

  return (
    <PageContainer title="Wishlist" subtitle={`${items.length} saved ${items.length === 1 ? 'item' : 'items'}`}>
      <Grid container spacing={2.5}>
        {items.map((item) => (
          <Grid item xs={12} md={6} key={item._id}>
            <WishlistItem item={item} />
          </Grid>
        ))}
      </Grid>
    </PageContainer>
  )
}
