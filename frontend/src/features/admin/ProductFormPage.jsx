import { Button, Grid, MenuItem, Paper, Stack, TextField } from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import ErrorMessage from '../../components/ErrorMessage'
import Loader from '../../components/Loader'
import PageContainer from '../../components/PageContainer'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { useFetch } from '../../hooks/useFetch'
import { fieldProps } from '../../lib/forms'
import { http } from '../../lib/http'
import { notify } from '../../lib/notify'
import { selectBrands, selectCategories } from '../catalog/catalogSlice'
import { fetchProduct } from '../products/productApi'

const EMPTY = {
  title: '',
  description: '',
  price: '',
  discountPercentage: 0,
  stockQuantity: '',
  brand: '',
  category: '',
  thumbnail: '',
  images: '',
}

const URL_PATTERN = { value: /^https?:\/\/\S+$/i, message: 'Enter a valid URL starting with http(s)://' }

const toFormValues = (product) => ({
  ...EMPTY,
  title: product.title,
  description: product.description,
  price: product.price,
  discountPercentage: product.discountPercentage,
  stockQuantity: product.stockQuantity,
  brand: product.brand?._id || '',
  category: product.category?._id || '',
  thumbnail: product.thumbnail,
  images: product.images.join('\n'),
})

const toPayload = (values) => ({
  title: values.title,
  description: values.description,
  price: Number(values.price),
  discountPercentage: Number(values.discountPercentage) || 0,
  stockQuantity: Number(values.stockQuantity),
  brand: values.brand,
  category: values.category,
  thumbnail: values.thumbnail,
  images: values.images
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean),
})

export default function ProductFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const brands = useSelector(selectBrands)
  const categories = useSelector(selectCategories)
  const form = useForm({ defaultValues: EMPTY })
  const { register, formState } = form

  useDocumentTitle(editing ? 'Edit product' : 'Add product')

  const { data: product, error, loading, reload } = useFetch(() => (editing ? fetchProduct(id) : Promise.resolve(null)), [id])

  useEffect(() => {
    if (product) form.reset(toFormValues(product))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  const onSubmit = async (values) => {
    const payload = toPayload(values)
    const saved = await notify(
      editing ? http.patch(`/products/${id}`, payload) : http.post('/products', payload),
      editing ? 'Product updated' : 'Product created'
    )

    if (saved) navigate('/admin/products')
  }

  if (loading) return <Loader />
  if (error) {
    return (
      <PageContainer title="Edit product">
        <ErrorMessage error={error} onRetry={reload} />
      </PageContainer>
    )
  }

  const select = (name, label, options) => (
    <Controller
      name={name}
      control={form.control}
      rules={{ required: `${label} is required` }}
      render={({ field, fieldState }) => (
        <TextField
          select
          fullWidth
          label={label}
          {...field}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
        >
          {options.map((option) => (
            <MenuItem key={option._id} value={option._id} sx={{ textTransform: 'capitalize' }}>
              {option.name}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  )

  return (
    <PageContainer title={editing ? 'Edit product' : 'Add product'} maxWidth="md">
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack component="form" noValidate spacing={3} onSubmit={form.handleSubmit(onSubmit)}>
          <TextField label="Title" fullWidth {...fieldProps(form, 'title', { required: 'Title is required' })} />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={4}
            {...fieldProps(form, 'description', { required: 'Description is required', minLength: { value: 10, message: 'Write at least 10 characters' } })}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Price"
                type="number"
                fullWidth
                inputProps={{ min: 0, step: '0.01' }}
                {...fieldProps(form, 'price', { required: 'Price is required', min: { value: 0, message: 'Price cannot be negative' } })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Discount (%)"
                type="number"
                fullWidth
                inputProps={{ min: 0, max: 100, step: '0.01' }}
                {...fieldProps(form, 'discountPercentage', {
                  min: { value: 0, message: 'Cannot be below 0' },
                  max: { value: 100, message: 'Cannot be above 100' },
                })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Stock"
                type="number"
                fullWidth
                inputProps={{ min: 0, step: 1 }}
                {...fieldProps(form, 'stockQuantity', {
                  required: 'Stock is required',
                  min: { value: 0, message: 'Stock cannot be negative' },
                  validate: (value) => Number.isInteger(Number(value)) || 'Use a whole number',
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {select('brand', 'Brand', brands)}
            </Grid>
            <Grid item xs={12} sm={6}>
              {select('category', 'Category', categories)}
            </Grid>
          </Grid>

          <TextField label="Thumbnail URL" fullWidth {...fieldProps(form, 'thumbnail', { required: 'Thumbnail is required', pattern: URL_PATTERN })} />
          <TextField
            label="Image URLs"
            fullWidth
            multiline
            minRows={3}
            helperText={formState.errors.images?.message || 'One URL per line'}
            error={Boolean(formState.errors.images)}
            {...register('images', {
              required: 'Add at least one image',
              validate: (value) =>
                value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .every((line) => URL_PATTERN.value.test(line)) || URL_PATTERN.message,
            })}
          />

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button color="inherit" onClick={() => navigate('/admin/products')}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={formState.isSubmitting}>
              {editing ? 'Save changes' : 'Create product'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </PageContainer>
  )
}
