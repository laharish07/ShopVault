import { Button, Chip, Divider, Paper, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import ErrorMessage from '../../components/ErrorMessage'
import Loader from '../../components/Loader'
import PageContainer from '../../components/PageContainer'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useFetch } from '../../hooks/useFetch'
import { formatDate, formatPrice, shortOrderId } from '../../lib/format'
import { http } from '../../lib/http'
import { notify } from '../../lib/notify'
import OrderLines from './OrderLines'
import { STATUS_COLORS } from './orderUtils'

export default function OrdersPage() {
  useDocumentTitle('My orders')
  const { data: orders, error, loading, reload, setData } = useFetch(() => http.get('/orders/mine').then((res) => res.data))

  const cancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return

    const response = await notify(http.patch(`/orders/${id}/cancel`), 'Order cancelled')
    if (response) setData((current) => current.map((order) => (order._id === id ? response.data : order)))
  }

  if (loading && !orders) return <Loader />
  if (error) {
    return (
      <PageContainer title="My orders">
        <ErrorMessage error={error} onRetry={reload} />
      </PageContainer>
    )
  }
  if (orders.length === 0) {
    return <EmptyState title="No orders yet" message="When you place an order it will show up here." actionLabel="Start shopping" actionTo="/" />
  }

  return (
    <PageContainer title="My orders" maxWidth="md">
      <Stack spacing={2.5}>
        {orders.map((order) => (
          <Paper key={order._id} variant="outlined">
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ px: 3, py: 2 }}>
              <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                <div>
                  <Typography variant="caption" color="text.secondary">
                    Order
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>#{shortOrderId(order._id)}</Typography>
                </div>
                <div>
                  <Typography variant="caption" color="text.secondary">
                    Placed on
                  </Typography>
                  <Typography>{formatDate(order.createdAt)}</Typography>
                </div>
                <div>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                  <Typography>{formatPrice(order.total)}</Typography>
                </div>
              </Stack>
              <Chip label={order.status} color={STATUS_COLORS[order.status]} size="small" />
            </Stack>
            <Divider />
            <Stack sx={{ p: 3 }} spacing={2.5}>
              <OrderLines items={order.item} compact />
              <Stack direction="row" spacing={1}>
                <Button component={Link} to={`/orders/${order._id}`} variant="outlined" size="small">
                  View details
                </Button>
                {order.status === 'Pending' && (
                  <Button color="error" size="small" onClick={() => cancel(order._id)}>
                    Cancel order
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </PageContainer>
  )
}
