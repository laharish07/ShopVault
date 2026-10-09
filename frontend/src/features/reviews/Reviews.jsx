import { Alert, Box, Button, Divider, LinearProgress, Paper, Rating, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import ErrorMessage from '../../components/ErrorMessage'
import Loader from '../../components/Loader'
import { useFetch } from '../../hooks/useFetch'
import { formatDate } from '../../lib/format'
import { http } from '../../lib/http'
import { notify } from '../../lib/notify'
import { selectUser } from '../auth/authSlice'

const fetchReviews = (productId) => http.get(`/reviews/product/${productId}`).then((res) => res.data)

function Summary({ summary }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems={{ sm: 'center' }}>
      <Box>
        <Typography variant="h2" component="p">
          {summary.average.toFixed(1)}
        </Typography>
        <Rating value={summary.average} precision={0.1} readOnly size="small" />
        <Typography variant="body2" color="text.secondary">
          {summary.count} {summary.count === 1 ? 'review' : 'reviews'}
        </Typography>
      </Box>
      <Stack spacing={0.75} sx={{ flex: 1, maxWidth: 320 }}>
        {[5, 4, 3, 2, 1].map((star) => (
          <Stack key={star} direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="body2" sx={{ width: 12 }}>
              {star}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={summary.count ? (summary.counts[star] / summary.count) * 100 : 0}
              sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: 'text.primary' } }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ width: 24, textAlign: 'right' }}>
              {summary.counts[star]}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}

function ReviewForm({ initial, submitLabel, onSubmit, onCancel }) {
  const { control, register, handleSubmit, reset, formState } = useForm({
    defaultValues: { rating: initial?.rating ?? 0, comment: initial?.comment ?? '' },
  })

  const submit = async (values) => {
    const done = await onSubmit({ ...values, rating: Number(values.rating) })
    if (done && !initial) reset({ rating: 0, comment: '' })
  }

  return (
    <Stack component="form" spacing={2} noValidate onSubmit={handleSubmit(submit)}>
      <Box>
        <Controller
          name="rating"
          control={control}
          rules={{ validate: (value) => value >= 1 || 'Choose a rating' }}
          render={({ field }) => (
            <Rating value={Number(field.value)} onChange={(event, value) => field.onChange(value ?? 0)} size="large" />
          )}
        />
        {formState.errors.rating && (
          <Typography variant="caption" color="error" display="block">
            {formState.errors.rating.message}
          </Typography>
        )}
      </Box>
      <TextField
        label="Your review"
        multiline
        minRows={3}
        error={Boolean(formState.errors.comment)}
        helperText={formState.errors.comment?.message}
        {...register('comment', { required: 'Write a few words about the product', minLength: { value: 3, message: 'Write a few words about the product' } })}
      />
      <Stack direction="row" spacing={1}>
        <Button type="submit" variant="contained" disabled={formState.isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button onClick={onCancel} color="inherit">
            Cancel
          </Button>
        )}
      </Stack>
    </Stack>
  )
}

function ReviewItem({ review, canManage, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <ReviewForm
        initial={review}
        submitLabel="Save changes"
        onCancel={() => setEditing(false)}
        onSubmit={async (values) => {
          const done = await onEdit(review._id, values)
          if (done) setEditing(false)
          return done
        }}
      />
    )
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography sx={{ fontWeight: 600 }}>{review.user.name}</Typography>
          <Rating value={review.rating} readOnly size="small" />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {formatDate(review.createdAt)}
        </Typography>
      </Stack>
      <Typography sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{review.comment}</Typography>
      {canManage && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button size="small" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button size="small" color="error" onClick={() => onDelete(review._id)}>
            Delete
          </Button>
        </Stack>
      )}
    </Box>
  )
}

export default function Reviews({ productId }) {
  const user = useSelector(selectUser)
  const { data, error, loading, reload } = useFetch(() => fetchReviews(productId), [productId])

  if (loading && !data) return <Loader />
  if (error) return <ErrorMessage error={error} onRetry={reload} />

  const mine = data.items.find((review) => review.user._id === user._id)

  const create = async (values) => {
    const done = await notify(http.post('/reviews', { product: productId, ...values }), 'Thanks for your review')
    if (done) reload()
    return Boolean(done)
  }

  const edit = async (id, values) => {
    const done = await notify(http.patch(`/reviews/${id}`, values), 'Review updated')
    if (done) reload()
    return Boolean(done)
  }

  const remove = async (id) => {
    if (!window.confirm('Delete your review?')) return
    const done = await notify(http.delete(`/reviews/${id}`), 'Review deleted')
    if (done) reload()
  }

  return (
    <Stack spacing={4}>
      <Typography variant="h4" component="h2">
        Customer reviews
      </Typography>

      {data.summary.count > 0 ? <Summary summary={data.summary} /> : <Typography color="text.secondary">No reviews yet.</Typography>}

      {!user.isAdmin &&
        (mine ? (
          <Alert severity="info">You have already reviewed this product. You can edit or delete your review below.</Alert>
        ) : (
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Write a review
            </Typography>
            <ReviewForm submitLabel="Post review" onSubmit={create} />
          </Paper>
        ))}

      {data.items.length > 0 && (
        <Stack divider={<Divider flexItem />} spacing={3}>
          {data.items.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              canManage={review.user._id === user._id}
              onEdit={edit}
              onDelete={remove}
            />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
