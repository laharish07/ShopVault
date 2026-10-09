import { MenuItem, Pagination, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useState } from 'react'
import ErrorMessage from '../../components/ErrorMessage'
import Loader from '../../components/Loader'
import PageContainer from '../../components/PageContainer'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useFetch } from '../../hooks/useFetch'
import { ORDER_STATUSES } from '../../lib/constants'
import { formatDate, formatPrice, shortOrderId } from '../../lib/format'
import { http } from '../../lib/http'
import { notify } from '../../lib/notify'
import { paymentLabel } from '../orders/orderUtils'

const PAGE_SIZE = 15

export default function AdminOrdersPage() {
  useDocumentTitle('Manage orders')
  const [page, setPage] = useState(1)
  const { data, error, loading, reload, setData } = useFetch(
    () => http.get('/orders', { params: { page, limit: PAGE_SIZE } }).then((res) => res.data),
    [page]
  )

  const changeStatus = async (order, status) => {
    const response = await notify(http.patch(`/orders/${order._id}/status`, { status }), 'Order status updated')
    if (response) {
      setData((current) => ({ ...current, items: current.items.map((item) => (item._id === order._id ? response.data : item)) }))
    }
  }

  return (
    <PageContainer title="Orders" subtitle={data ? `${data.total} orders` : undefined}>
      {error ? (
        <ErrorMessage error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Loader />
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Placed</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>#{shortOrderId(order._id)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{order.user?.name || 'Deleted user'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.user?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.item.reduce((count, line) => count + line.quantity, 0)}</TableCell>
                    <TableCell>{paymentLabel(order.paymentMode)}</TableCell>
                    <TableCell align="right">{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={order.status}
                        onChange={(event) => changeStatus(order, event.target.value)}
                        disabled={order.status === 'Cancelled'}
                        inputProps={{ 'aria-label': `Status for order ${shortOrderId(order._id)}` }}
                        sx={{ minWidth: 160 }}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {data.total > PAGE_SIZE && (
            <Stack alignItems="center" sx={{ mt: 3 }}>
              <Pagination count={Math.ceil(data.total / PAGE_SIZE)} page={page} onChange={(event, value) => setPage(value)} />
            </Stack>
          )}
        </>
      )}
    </PageContainer>
  )
}
