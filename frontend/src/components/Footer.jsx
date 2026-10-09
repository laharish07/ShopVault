import { Box, Container, Link as MuiLink, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

const linkSx = { color: 'inherit', opacity: 0.75, textDecoration: 'none', '&:hover': { opacity: 1 } }

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'primary.main', color: '#f2f0ea', mt: 'auto' }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={4}>
          <Box sx={{ maxWidth: 320 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
              ShopVault
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Electronics, home and everyday essentials, shipped quickly and priced fairly.
            </Typography>
          </Box>

          <Stack direction="row" spacing={8}>
            <Stack spacing={1}>
              <Typography variant="overline" sx={{ opacity: 0.6 }}>
                Shop
              </Typography>
              <MuiLink component={Link} to="/" sx={linkSx}>
                All products
              </MuiLink>
              <MuiLink component={Link} to="/wishlist" sx={linkSx}>
                Wishlist
              </MuiLink>
              <MuiLink component={Link} to="/cart" sx={linkSx}>
                Cart
              </MuiLink>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="overline" sx={{ opacity: 0.6 }}>
                Account
              </Typography>
              <MuiLink component={Link} to="/account" sx={linkSx}>
                Profile
              </MuiLink>
              <MuiLink component={Link} to="/orders" sx={linkSx}>
                Orders
              </MuiLink>
            </Stack>
          </Stack>
        </Stack>

        <Typography variant="caption" sx={{ display: 'block', mt: 4, opacity: 0.5 }}>
          &copy; {new Date().getFullYear()} ShopVault. All rights reserved.
        </Typography>
      </Container>
    </Box>
  )
}
