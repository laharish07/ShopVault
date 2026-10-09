import { Box, Button, Chip, InputBase, Pagination, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorMessage from '../../components/ErrorMessage'
import Loader from '../../components/Loader'
import PageContainer from '../../components/PageContainer'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useFetch } from '../../hooks/useFetch'
import { formatPrice } from '../../lib/format'
import { http } from '../../lib/http'
import { notify } from '../../lib/notify'
import { fetchProducts } from '../products/productApi'

const PAGE_SIZE = 15

export default function AdminProductsPage() {
  useDocumentTitle('Manage products')
  const [page, setPage] = useState(1)
  const [term, setTerm] = useState('')
  const [search, setSearch] = useState('')

  const { data, error, loading, reload } = useFetch(
    () => fetchProducts({ page, limit: PAGE_SIZE, q: search || undefined }),
    [page, search]
  )

  const submitSearch = (event) => {
    event.preventDefault()
    setPage(1)
    setSearch(term.trim())
  }

  const toggleDeleted = async (product) => {
    const restoring = product.isDeleted
    if (!restoring && !window.confirm(`Remove "${product.title}" from the store?`)) return

    const done = await notify(
      restoring ? http.patch(`/products/${product._id}/restore`) : http.delete(`/products/${product._id}`),
      restoring ? 'Product restored' : 'Product removed'
    )
    if (done) reload()
  }

  return (
    <PageContainer
      title="Products"
      subtitle={data ? `${data.total} in the catalogue` : undefined}
      actions={
        <Button component={Link} to="/admin/products/new" variant="contained">
          Add product
        </Button>
      }
    >
      <Box component="form" role="search" onSubmit={submitSearch} sx={{ mb: 3, px: 1.5, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 2, maxWidth: 360 }}>
        <InputBase value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search by title" fullWidth inputProps={{ 'aria-label': 'Search products' }} sx={{ py: 0.75 }} />
      </Box>

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
                  <TableCell>Product</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((product) => (
                  <TableRow key={product._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box component="img" src={product.thumbnail} alt="" sx={{ width: 44, height: 44, borderRadius: 1, objectFit: 'cover', bgcolor: '#efede8' }} />
                        <Typography component={Link} to={`/products/${product._id}`} sx={{ fontWeight: 600, color: 'inherit', textDecoration: 'none', maxWidth: 260 }} noWrap>
                          {product.title}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{product.brand?.name}</TableCell>
                    <TableCell align="right">{formatPrice(product.price)}</TableCell>
                    <TableCell align="right">{product.stockQuantity}</TableCell>
                    <TableCell>
                      {product.isDeleted ? (
                        <Chip size="small" label="Removed" />
                      ) : product.stockQuantity === 0 ? (
                        <Chip size="small" color="warning" label="Out of stock" />
                      ) : (
                        <Chip size="small" color="success" variant="outlined" label="Live" />
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Button size="small" component={Link} to={`/admin/products/${product._id}/edit`}>
                        Edit
                      </Button>
                      <Button size="small" color={product.isDeleted ? 'primary' : 'error'} onClick={() => toggleDeleted(product)}>
                        {product.isDeleted ? 'Restore' : 'Remove'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {data.items.length === 0 && (
            <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              No products match your search.
            </Typography>
          )}

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
