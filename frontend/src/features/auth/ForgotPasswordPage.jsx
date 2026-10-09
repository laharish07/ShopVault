import { Alert, Button, Link as MuiLink, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { EMAIL_RULES, fieldProps } from '../../lib/forms'
import { http } from '../../lib/http'
import { notify } from '../../lib/notify'
import AuthShell from './AuthShell'

export default function ForgotPasswordPage() {
  const form = useForm({ defaultValues: { email: '' } })
  const [message, setMessage] = useState('')

  const onSubmit = async (values) => {
    const response = await notify(http.post('/auth/forgot-password', values))
    if (response) setMessage(response.data.message)
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email you signed up with and we will send you a reset link."
      footer={
        <MuiLink component={Link} to="/login" underline="hover" fontWeight={600}>
          Back to sign in
        </MuiLink>
      }
    >
      {message ? (
        <Alert severity="success">{message}</Alert>
      ) : (
        <Stack component="form" spacing={2.5} noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <TextField label="Email" type="email" autoComplete="email" autoFocus {...fieldProps(form, 'email', EMAIL_RULES)} />
          <Button type="submit" variant="contained" size="large" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Sending...' : 'Send reset link'}
          </Button>
        </Stack>
      )}
    </AuthShell>
  )
}
