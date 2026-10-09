import { Avatar, Box, Button, Grid, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EmptyState from '../../components/EmptyState'
import Loader from '../../components/Loader'
import PageContainer from '../../components/PageContainer'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { initialsOf } from '../../lib/format'
import { notify } from '../../lib/notify'
import { selectUser } from '../auth/authSlice'
import AddressForm from './AddressForm'
import AddressLines from './AddressLines'
import { deleteAddress, selectAddresses, selectAddressesReady } from './addressSlice'

export default function AccountPage() {
  useDocumentTitle('Your account')
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const addresses = useSelector(selectAddresses)
  const ready = useSelector(selectAddressesReady)
  const [dialog, setDialog] = useState({ open: false, address: null })

  const openDialog = (address = null) => setDialog({ open: true, address })
  const closeDialog = () => setDialog((current) => ({ ...current, open: false }))

  const remove = (address) => {
    if (window.confirm(`Delete the "${address.type}" address?`)) {
      notify(dispatch(deleteAddress(address._id)), 'Address deleted')
    }
  }

  return (
    <PageContainer title="Your account" maxWidth="md">
      <Stack spacing={4}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Avatar sx={{ width: 64, height: 64, fontSize: 22, bgcolor: 'primary.main' }}>{initialsOf(user.name)}</Avatar>
            <Box>
              <Typography variant="h4">{user.name}</Typography>
              <Typography color="text.secondary">{user.email}</Typography>
            </Box>
          </Stack>
        </Paper>

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h4" component="h2">
              Saved addresses
            </Typography>
            <Button variant="contained" onClick={() => openDialog()}>
              Add address
            </Button>
          </Stack>

          {!ready ? (
            <Loader />
          ) : addresses.length === 0 ? (
            <Paper variant="outlined">
              <EmptyState title="No addresses yet" message="Add one now to speed up checkout." />
            </Paper>
          ) : (
            <Grid container spacing={2.5}>
              {addresses.map((address) => (
                <Grid item xs={12} sm={6} key={address._id}>
                  <Paper variant="outlined" sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                      {address.type}
                    </Typography>
                    <AddressLines address={address} />
                    <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 2 }}>
                      <Button size="small" onClick={() => openDialog(address)}>
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => remove(address)}>
                        Delete
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Stack>

      <AddressForm open={dialog.open} address={dialog.address} onClose={closeDialog} />
    </PageContainer>
  )
}
