import { Button, Link as MuiLink, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { http } from '../../lib/http'
import { fieldProps } from '../../lib/forms'
import { notify } from '../../lib/notify'
import AuthShell from './AuthShell'
import { logout, selectAuthReady, selectUser, verifyOtp } from './authSlice'

const RESEND_SECONDS = 30

export default function VerifyEmailPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const ready = useSelector(selectAuthReady)
  const user = useSelector(selectUser)
  const form = useForm({ defaultValues: { otp: '' } })
  const [cooldown, setCooldown] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  if (!ready) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.isVerified) return <Navigate to={user.isAdmin ? '/admin/products' : '/'} replace />

  const onSubmit = async ({ otp }) => {
    const verified = await notify(dispatch(verifyOtp(otp)), 'Email verified')
    if (verified) navigate(verified.isAdmin ? '/admin/products' : '/', { replace: true })
  }

  const resend = async () => {
    const response = await notify(http.post('/auth/resend-otp'))
    if (response) {
      toast.success(response.data.message)
      setCooldown(RESEND_SECONDS)
    }
  }

  const switchAccount = async () => {
    await dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <AuthShell
      title="Check your email"
      subtitle={`We sent a 6 digit code to ${user.email}. Enter it below to finish setting up your account.`}
      footer={
        <MuiLink component="button" type="button" underline="hover" onClick={switchAccount}>
          Use a different account
        </MuiLink>
      }
    >
      <Stack component="form" spacing={2.5} noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <TextField
          label="Verification code"
          autoFocus
          autoComplete="one-time-code"
          inputProps={{ inputMode: 'numeric', maxLength: 6, style: { letterSpacing: '0.5em', fontSize: 20 } }}
          {...fieldProps(form, 'otp', {
            required: 'Enter the code from your email',
            pattern: { value: /^\d{6}$/, message: 'The code is 6 digits' },
          })}
        />
        <Button type="submit" variant="contained" size="large" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Verifying...' : 'Verify email'}
        </Button>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Did not get it?{' '}
          {cooldown > 0 ? (
            `You can request a new code in ${cooldown}s`
          ) : (
            <MuiLink component="button" type="button" underline="hover" onClick={resend}>
              Send a new code
            </MuiLink>
          )}
        </Typography>
      </Stack>
    </AuthShell>
  )
}
