import { Button, Stack, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { PASSWORD_RULES, fieldProps } from '../../lib/forms'
import { http } from '../../lib/http'
import { notify } from '../../lib/notify'
import AuthShell from './AuthShell'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const form = useForm({ defaultValues: { password: '', confirmPassword: '' } })

  const onSubmit = async ({ password }) => {
    const response = await notify(http.post('/auth/reset-password', { token, password }))
    if (!response) return

    toast.success(response.data.message)
    navigate('/login', { replace: true })
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Pick something you have not used elsewhere.">
      <Stack component="form" spacing={2.5} noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <TextField label="New password" type="password" autoComplete="new-password" autoFocus {...fieldProps(form, 'password', PASSWORD_RULES)} />
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          {...fieldProps(form, 'confirmPassword', {
            required: 'Confirm your password',
            validate: (value) => value === form.getValues('password') || 'Passwords do not match',
          })}
        />
        <Button type="submit" variant="contained" size="large" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Update password'}
        </Button>
      </Stack>
    </AuthShell>
  )
}
