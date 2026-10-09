import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { IconButton, Stack, Typography } from '@mui/material'

export default function QuantityStepper({ value, min = 1, max, onChange, disabled }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{ border: 1, borderColor: 'divider', borderRadius: 2, width: 'fit-content', bgcolor: 'background.paper' }}
    >
      <IconButton aria-label="Decrease quantity" size="small" disabled={disabled || value <= min} onClick={() => onChange(value - 1)}>
        <RemoveIcon fontSize="small" />
      </IconButton>
      <Typography aria-live="polite" sx={{ minWidth: 32, textAlign: 'center', fontWeight: 600 }}>
        {value}
      </Typography>
      <IconButton
        aria-label="Increase quantity"
        size="small"
        disabled={disabled || (max !== undefined && value >= max)}
        onClick={() => onChange(value + 1)}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Stack>
  )
}
