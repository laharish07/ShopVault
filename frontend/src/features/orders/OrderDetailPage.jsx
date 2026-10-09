import { Alert, Button, Chip, Grid, Paper, Stack, Typography } from '@mui/material'
import { Link, useLocation, useParams } from 'react-router-dom'
import AddressLines from '../addresses/AddressLines'
import EmptyState from '../../components/EmptyState'
import ErrorMessage from '../../components/ErrorMessage'
import Loader from '../../components/Loader'
import PageContainer from '../../components/PageContainer'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useFetch } from '../../hooks/useFetch'
import { formatDate, shortOrderId } from '../../lib/format'
import { http } from '../../lib/http'
import { notify } from '../../lib/notify'
import OrderLines from './OrderLines'
import OrderSummary from './OrderSummary'
import { STATUS_COLORS, paymentLabel } from './orderUtils'

export default function OrderDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const { data: order, error, loading, reload, setData } = useFetch(() => http.get(`/orders/${id}`).then((res) => res.data), [id])

  useDocumentTitle(order ? `Order #${shortOrderId(order._id)}` : 'Order')

  if (loading && !order) return <Loader />
  if (error?.status === 404) {
    return <EmptyState title="Order not found" actionLabel="Back to orders" actionTo="/orders" />
  }
  if (error) {
    return (
      <PageContainer>
        <ErrorMessage error={error} onRetry={reload} />
      </PageContainer>
    )
  }

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return

    const response = await notify(http.patch(`/orders/${order._id}/cancel`), 'Order cancelled')
    if (response) setData(response.data)
  }

  const address = order.address[0]

  return (
    <PageContainer
      title={`Order #${shortOrderId(order._id)}`}
      subtitle={`Placed on ${formatDate(order.createdAt)}`}
      maxWidth="md"
      actions={<Chip label={order.status} color={STATUS_COLORS[order.status]} />}
    >
      <Stack spacing={3}>
        {location.state?.placed && (
          <Alert severity="success">Thank you, your order has been placed. We will start preparing it right away.</Alert>
        )}

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2.5 }}>
            Items
          </Typography>
          <OrderLines items={order.item} />
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" sx={{ mb: 1.5 }}>
                Delivery address
              </Typography>
              {address && <AddressLines address={address} />}
              <Typography variant="h6" sx={{ mt: 3, mb: 0.5 }}>
                Payment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {paymentLabel(order.paymentMode)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Summary
              </Typography>
              <OrderSummary summary={order} />
            </Paper>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1}>
          <Button component={Link} to="/orders" variant="outlined">
            All orders
          </Button>
          {order.status === 'Pending' && (
            <Button color="error" onClick={cancel}>
              Cancel order
            </Button>
          )}
        </Stack>
      </Stack>
    </PageContainer>
  )
}
