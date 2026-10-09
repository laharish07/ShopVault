import { Box, Checkbox, Divider, FormControlLabel, FormGroup, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { selectBrands, selectCategories } from '../catalog/catalogSlice'

export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'price:asc', label: 'Price: low to high' },
  { value: 'price:desc', label: 'Price: high to low' },
  { value: 'title:asc', label: 'Name: A to Z' },
]

function CheckboxGroup({ title, options, selected, onToggle }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary">
        {title}
      </Typography>
      <FormGroup sx={{ maxHeight: 260, overflowY: 'auto', flexWrap: 'nowrap' }}>
        {options.map((option) => (
          <FormControlLabel
            key={option._id}
            label={<span style={{ textTransform: 'capitalize' }}>{option.name}</span>}
            control={<Checkbox size="small" checked={selected.includes(option._id)} onChange={() => onToggle(option._id)} />}
          />
        ))}
      </FormGroup>
    </Box>
  )
}

export default function ProductFilters({ filters, onChange }) {
  const brands = useSelector(selectBrands)
  const categories = useSelector(selectCategories)

  const toggle = (key) => (id) => {
    const current = filters[key]
    onChange({ [key]: current.includes(id) ? current.filter((value) => value !== id) : [...current, id] })
  }

  return (
    <Stack spacing={2.5}>
      <TextField select size="small" label="Sort by" value={filters.sort} onChange={(event) => onChange({ sort: event.target.value })}>
        {SORT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <Divider />
      <CheckboxGroup title="Category" options={categories} selected={filters.category} onToggle={toggle('category')} />
      <Divider />
      <CheckboxGroup title="Brand" options={brands} selected={filters.brand} onToggle={toggle('brand')} />
    </Stack>
  )
}
