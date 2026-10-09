import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { fieldProps } from '../../lib/forms'
import { notify } from '../../lib/notify'
import { createAddress, updateAddress } from './addressSlice'

const EMPTY = { type: '', street: '', city: '', state: '', postalCode: '', country: '', phoneNumber: '' }

const required = (label) => ({ required: `${label} is required` })

// Dialog used both for adding a new address and for editing a saved one.
export default function AddressForm({ open, address, onClose, onSaved }) {
  const dispatch = useDispatch()
  const form = useForm({ defaultValues: EMPTY })

  useEffect(() => {
    if (open) form.reset(address ? { ...EMPTY, ...address } : EMPTY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, address])

  const onSubmit = async (values) => {
    const { _id, user, __v, ...data } = values
    const saved = await notify(
      dispatch(address ? updateAddress({ id: address._id, data: data }) : createAddress(data)),
      address ? 'Address updated' : 'Address added'
    )

    if (saved) {
      onSaved?.(saved)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{address ? 'Edit address' : 'Add a new address'}</DialogTitle>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Label" placeholder="Home, Office..." {...fieldProps(form, 'type', required('Label'))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone number"
                type="tel"
                {...fieldProps(form, 'phoneNumber', {
                  required: 'Phone number is required',
                  pattern: { value: /^\+?\d{7,15}$/, message: 'Digits only, 7 to 15 numbers' },
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Street address" {...fieldProps(form, 'street', required('Street'))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="City" {...fieldProps(form, 'city', required('City'))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="State" {...fieldProps(form, 'state', required('State'))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal code"
                {...fieldProps(form, 'postalCode', {
                  required: 'Postal code is required',
                  pattern: { value: /^[A-Za-z0-9 -]{3,10}$/, message: 'Enter a valid postal code' },
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Country" {...fieldProps(form, 'country', required('Country'))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={form.formState.isSubmitting}>
            {address ? 'Save changes' : 'Save address'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
