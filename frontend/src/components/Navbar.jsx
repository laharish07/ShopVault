import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputBase,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { logout, selectUser } from '../features/auth/authSlice'
import { selectCartCount } from '../features/cart/cartSlice'
import { selectWishlistItems } from '../features/wishlist/wishlistSlice'
import { initialsOf } from '../lib/format'

const navLinkSx = {
  color: 'text.secondary',
  textDecoration: 'none',
  fontWeight: 500,
  px: 1.5,
  py: 0.5,
  borderRadius: 1,
  '&.active': { color: 'text.primary', bgcolor: 'action.hover' },
}

function SearchBox() {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')

  const submit = (event) => {
    event.preventDefault()
    navigate(term.trim() ? `/?q=${encodeURIComponent(term.trim())}` : '/')
  }

  return (
    <Box
      component="form"
      role="search"
      onSubmit={submit}
      sx={{
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        flex: 1,
        maxWidth: 380,
        mx: 3,
        px: 1.5,
        bgcolor: 'action.hover',
        borderRadius: 2,
      }}
    >
      <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
      <InputBase
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search products"
        inputProps={{ 'aria-label': 'Search products' }}
        sx={{ ml: 1, flex: 1, py: 0.5 }}
      />
    </Box>
  )
}

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const cartCount = useSelector(selectCartCount)
  const wishlistCount = useSelector(selectWishlistItems).length
  const [anchor, setAnchor] = useState(null)

  const closeMenu = () => setAnchor(null)
  const go = (path) => {
    closeMenu()
    navigate(path)
  }
  const signOut = async () => {
    closeMenu()
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg" disableGutters sx={{ px: { xs: 2, md: 3 } }}>
        <Toolbar disableGutters sx={{ minHeight: 64 }}>
          <Typography
            component={Link}
            to={user.isAdmin ? '/admin/products' : '/'}
            variant="h5"
            sx={{ color: 'text.primary', textDecoration: 'none', fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            ShopVault
          </Typography>

          {user.isAdmin ? (
            <Stack direction="row" spacing={0.5} sx={{ ml: 3, flex: 1 }}>
              <Box component={NavLink} to="/admin/products" sx={navLinkSx}>
                Products
              </Box>
              <Box component={NavLink} to="/admin/orders" sx={navLinkSx}>
                Orders
              </Box>
            </Stack>
          ) : (
            <SearchBox />
          )}

          <Box sx={{ flex: { xs: 1, md: 0 } }} />

          <Stack direction="row" alignItems="center" spacing={0.5}>
            {!user.isAdmin && (
              <>
                <Tooltip title="Wishlist">
                  <IconButton component={Link} to="/wishlist" aria-label={`Wishlist, ${wishlistCount} saved`}>
                    <Badge badgeContent={wishlistCount} color="secondary">
                      <FavoriteBorderIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cart">
                  <IconButton component={Link} to="/cart" aria-label={`Cart, ${cartCount} items`}>
                    <Badge badgeContent={cartCount} color="secondary">
                      <ShoppingBagOutlinedIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              </>
            )}

            <Tooltip title="Account">
              <IconButton onClick={(event) => setAnchor(event.currentTarget)} aria-label="Open account menu" sx={{ ml: 0.5 }}>
                <Avatar sx={{ width: 34, height: 34, fontSize: 14, bgcolor: 'primary.main' }}>{initialsOf(user.name)}</Avatar>
              </IconButton>
            </Tooltip>
          </Stack>

          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={closeMenu} slotProps={{ paper: { sx: { minWidth: 200, mt: 1 } } }}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
            <Divider />
            {!user.isAdmin && (
              <MenuItem onClick={() => go('/account')}>
                <ListItemText>Profile and addresses</ListItemText>
              </MenuItem>
            )}
            {!user.isAdmin && (
              <MenuItem onClick={() => go('/orders')}>
                <ListItemText>My orders</ListItemText>
              </MenuItem>
            )}
            <MenuItem onClick={signOut}>
              <ListItemText>Sign out</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export function MobileSearch() {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')

  return (
    <Box
      component="form"
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        navigate(term.trim() ? `/?q=${encodeURIComponent(term.trim())}` : '/')
      }}
      sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mx: 2, mt: 2, px: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}
    >
      <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
      <InputBase
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search products"
        inputProps={{ 'aria-label': 'Search products' }}
        sx={{ ml: 1, flex: 1, py: 0.75 }}
      />
      <Button type="submit" size="small">
        Search
      </Button>
    </Box>
  )
}
