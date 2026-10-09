import { Button, Link as MuiLink, Stack, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { EMAIL_RULES, PASSWORD_RULES, fieldProps } from '../../lib/forms'
import { notify } from '../../lib/notify'
import AuthShell from './AuthShell'
import { signup } from './authSlice'

export default function SignupPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const form = useForm({ defaultValues: { name: '', email: '', password: '', confirmPassword: '' } })

  const onSubmit = async ({ confirmPassword, ...details }) => {
    const user = await notify(dispatch(signup(details)))
    if (user) navigate('/verify-email', { replace: true })
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          Already have an account?{' '}
          <MuiLink component={Link} to="/login" underline="hover" fontWeight={600}>
            Sign in
          </MuiLink>
        </>
      }
    >
      <Stack component="form" spacing={2.5} noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <TextField
          label="Full name"
          autoComplete="name"
          autoFocus
          {...fieldProps(form, 'name', { required: 'Name is required', minLength: { value: 2, message: 'Name is too short' } })}
        />
        <TextField label="Email" type="email" autoComplete="email" {...fieldProps(form, 'email', EMAIL_RULES)} />
        <TextField label="Password" type="password" autoComplete="new-password" {...fieldProps(form, 'password', PASSWORD_RULES)} />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          {...fieldProps(form, 'confirmPassword', {
            required: 'Confirm your password',
            validate: (value) => value === form.getValues('password') || 'Passwords do not match',
          })}
        />
        <Button type="submit" variant="contained" size="large" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </Stack>
    </AuthShell>
  )
}
