import TuneIcon from '@mui/icons-material/Tune'
import { Box, Button, Chip, Container, Drawer, Grid, Pagination, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import ErrorMessage from '../../components/ErrorMessage'
import Loader from '../../components/Loader'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useFetch } from '../../hooks/useFetch'
import { fetchProducts } from './productApi'
import ProductCard from './ProductCard'
import ProductFilters from './ProductFilters'

const PAGE_SIZE = 12

const readFilters = (params) => ({
  q: params.get('q') || '',
  sort: params.get('sort') || 'createdAt:desc',
  brand: params.getAll('brand'),
  category: params.getAll('category'),
  page: Math.max(parseInt(params.get('page'), 10) || 1, 1),
})

function Hero() {
  return (
    <Box sx={{ bgcolor: 'primary.main', color: '#f7f6f3' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Typography variant="overline" sx={{ opacity: 0.6, letterSpacing: '0.12em' }}>
          New season
        </Typography>
        <Typography variant="h1" sx={{ maxWidth: 640, fontSize: { xs: '2rem', md: '3rem' }, mt: 1 }}>
          Good gear for work, home and everything in between.
        </Typography>
        <Typography sx={{ maxWidth: 520, mt: 2, opacity: 0.75 }}>
          Browse phones, laptops, fragrances, furniture and more. Honest prices, quick delivery.
        </Typography>
      </Container>
    </Box>
  )
}

export default function HomePage() {
  useDocumentTitle('Shop')
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filters = readFilters(params)

  const [sort, order] = filters.sort.split(':')
  const query = { q: filters.q || undefined, sort, order, brand: filters.brand, category: filters.category, page: filters.page, limit: PAGE_SIZE }
  const { data, error, loading, reload } = useFetch(() => fetchProducts(query), [params.toString()])

  const update = (changes) => {
    const next = { ...filters, page: 1, ...changes }
    const search = new URLSearchParams()

    if (next.q) search.set('q', next.q)
    if (next.sort !== 'createdAt:desc') search.set('sort', next.sort)
    next.brand.forEach((id) => search.append('brand', id))
    next.category.forEach((id) => search.append('category', id))
    if (next.page > 1) search.set('page', String(next.page))

    setParams(search)
  }

  const activeCount = filters.brand.length + filters.category.length
  const pageCount = data ? Math.ceil(data.total / PAGE_SIZE) : 0

  return (
    <>
      <Hero />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }} gap={2} flexWrap="wrap">
          <Box>
            <Typography variant="h4" component="h2">
              {filters.q ? `Results for "${filters.q}"` : 'All products'}
            </Typography>
            {data && (
              <Typography variant="body2" color="text.secondary">
                {data.total} {data.total === 1 ? 'product' : 'products'}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            {filters.q && <Chip label="Clear search" onDelete={() => update({ q: '' })} />}
            <Button
              startIcon={<TuneIcon />}
              variant="outlined"
              onClick={() => setFiltersOpen(true)}
              sx={{ display: { md: 'none' } }}
            >
              Filters{activeCount ? ` (${activeCount})` : ''}
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={4}>
          <Grid item md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <ProductFilters filters={filters} onChange={update} />
          </Grid>

          <Grid item xs={12} md={9}>
            {error ? (
              <ErrorMessage error={error} onRetry={reload} />
            ) : loading && !data ? (
              <Loader />
            ) : data.items.length === 0 ? (
              <EmptyState
                title="No products found"
                message="Try removing a filter or searching for something else."
                actionLabel={filters.q || activeCount ? 'Clear all filters' : undefined}
                onAction={() => setParams({})}
              />
            ) : (
              <Box sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 150ms' }}>
                <Grid container spacing={2.5}>
                  {data.items.map((product) => (
                    <Grid item xs={6} sm={4} key={product._id}>
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>

                {pageCount > 1 && (
                  <Stack alignItems="center" sx={{ mt: 5 }}>
                    <Pagination count={pageCount} page={filters.page} onChange={(event, page) => update({ page })} />
                  </Stack>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      <Drawer anchor="left" open={filtersOpen} onClose={() => setFiltersOpen(false)} PaperProps={{ sx: { width: 300, p: 3 } }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Filters
        </Typography>
        <ProductFilters filters={filters} onChange={update} />
        <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={() => setFiltersOpen(false)}>
          Show results
        </Button>
      </Drawer>
    </>
  )
}
