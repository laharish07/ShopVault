import { Typography } from '@mui/material'

export const addressLines = (address) => [
  address.street,
  `${address.city}, ${address.state} ${address.postalCode}`,
  address.country,
  address.phoneNumber,
]

export default function AddressLines({ address }) {
  return addressLines(address).map((line) => (
    <Typography key={line} variant="body2" color="text.secondary">
      {line}
    </Typography>
  ))
}
