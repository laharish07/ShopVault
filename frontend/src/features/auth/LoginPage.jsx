import { Button, Link as MuiLink, Stack, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { EMAIL_RULES, fieldProps } from '../../lib/forms'
import { notify } from '../../lib/notify'
import AuthShell from './AuthShell'
import { login } from './authSlice'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const form = useForm({ defaultValues: { email: '', password: '' } })

  const onSubmit = async (values) => {
    const user = await notify(dispatch(login(values)))
    if (!user) return

    if (!user.isVerified) return navigate('/verify-email', { replace: true })
    if (user.isAdmin) return navigate('/admin/products', { replace: true })

    const from = location.state?.from
    navigate(from ? `${from.pathname}${from.search}` : '/', { replace: true })
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue shopping."
      footer={
        <>
          New here?{' '}
          <MuiLink component={Link} to="/signup" underline="hover" fontWeight={600}>
            Create an account
          </MuiLink>
        </>
      }
    >
      <Stack component="form" spacing={2.5} noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <TextField label="Email" type="email" autoComplete="email" autoFocus {...fieldProps(form, 'email', EMAIL_RULES)} />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          {...fieldProps(form, 'password', { required: 'Password is required' })}
        />
        <MuiLink component={Link} to="/forgot-password" underline="hover" variant="body2" sx={{ alignSelf: 'flex-end' }}>
          Forgot your password?
        </MuiLink>
        <Button type="submit" variant="contained" size="large" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </Stack>
    </AuthShell>
  )
}
