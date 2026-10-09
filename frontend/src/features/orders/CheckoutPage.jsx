import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import Loader from '../../components/Loader'
import PageContainer from '../../components/PageContainer'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { PAYMENT_MODES } from '../../lib/constants'
import { http } from '../../lib/http'
import { notify } from '../../lib/notify'
import AddressForm from '../addresses/AddressForm'
import AddressLines from '../addresses/AddressLines'
import { selectAddresses, selectAddressesReady } from '../addresses/addressSlice'
import { fetchCart, selectCartItems, selectCartReady, selectCartSummary } from '../cart/cartSlice'
import OrderLines from './OrderLines'
import OrderSummary from './OrderSummary'

export default function CheckoutPage() {
  useDocumentTitle('Checkout')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const items = useSelector(selectCartItems)
  const summary = useSelector(selectCartSummary)
  const cartReady = useSelector(selectCartReady)
  const addresses = useSelector(selectAddresses)
  const addressesReady = useSelector(selectAddressesReady)

  const [addressId, setAddressId] = useState('')
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0].value)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [placing, setPlacing] = useState(false)

  // Pre-select the first saved address once they load.
  useEffect(() => {
    if (!addressId && addresses.length) setAddressId(addresses[0]._id)
  }, [addresses, addressId])

  if (!cartReady || !addressesReady) return <Loader />
  if (items.length === 0 && !placing) return <Navigate to="/cart" replace />

  const placeOrder = async () => {
    setPlacing(true)
    const response = await notify(http.post('/orders', { addressId, paymentMode }))

    if (!response) {
      // The cart may have changed on the server (stock ran out), so refresh what we show.
      dispatch(fetchCart())
      setPlacing(false)
      return
    }

    await dispatch(fetchCart())
    navigate(`/orders/${response.data._id}`, { replace: true, state: { placed: true } })
  }

  return (
    <PageContainer title="Checkout">
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Stack spacing={4}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="h5">Delivery address</Typography>
                <Button size="small" onClick={() => setDialogOpen(true)}>
                  Add new
                </Button>
              </Stack>

              {addresses.length === 0 ? (
                <Alert severity="info" action={<Button onClick={() => setDialogOpen(true)}>Add address</Button>}>
                  Add a delivery address to place your order.
                </Alert>
              ) : (
                <RadioGroup value={addressId} onChange={(event) => setAddressId(event.target.value)}>
                  <Stack spacing={1.5}>
                    {addresses.map((address) => (
                      <Paper
                        key={address._id}
                        variant="outlined"
                        sx={{ px: 2, py: 1.5, borderColor: addressId === address._id ? 'text.primary' : 'divider', borderWidth: addressId === address._id ? 2 : 1 }}
                      >
                        <FormControlLabel
                          value={address._id}
                          control={<Radio />}
                          sx={{ alignItems: 'flex-start', m: 0, width: '100%' }}
                          label={
                            <Box sx={{ pt: 0.75 }}>
                              <Typography sx={{ fontWeight: 600 }}>{address.type}</Typography>
                              <AddressLines address={address} />
                            </Box>
                          }
                        />
                      </Paper>
                    ))}
                  </Stack>
                </RadioGroup>
              )}
            </Box>

            <Box>
              <Typography variant="h5" sx={{ mb: 1.5 }}>
                Payment method
              </Typography>
              <RadioGroup value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)}>
                <Stack spacing={1.5}>
                  {PAYMENT_MODES.map((mode) => (
                    <Paper
                      key={mode.value}
                      variant="outlined"
                      sx={{ px: 2, py: 1.5, borderColor: paymentMode === mode.value ? 'text.primary' : 'divider', borderWidth: paymentMode === mode.value ? 2 : 1 }}
                    >
                      <FormControlLabel
                        value={mode.value}
                        control={<Radio />}
                        sx={{ alignItems: 'flex-start', m: 0, width: '100%' }}
                        label={
                          <Box sx={{ pt: 0.75 }}>
                            <Typography sx={{ fontWeight: 600 }}>{mode.label}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {mode.hint}
                            </Typography>
                          </Box>
                        }
                      />
                    </Paper>
                  ))}
                </Stack>
              </RadioGroup>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3, position: { md: 'sticky' }, top: { md: 88 } }}>
            <Typography variant="h5" sx={{ mb: 2.5 }}>
              Your order
            </Typography>
            <OrderLines
              compact
              items={items.map((item) => ({ product: item.product, quantity: item.quantity, unitPrice: item.product.finalPrice }))}
            />
            <Box sx={{ mt: 3 }}>
              <OrderSummary summary={summary} />
            </Box>
            <Button variant="contained" size="large" fullWidth sx={{ mt: 3 }} disabled={!addressId || placing} onClick={placeOrder}>
              {placing ? 'Placing order...' : 'Place order'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <AddressForm open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={(address) => setAddressId(address._id)} />
    </PageContainer>
  )
}
