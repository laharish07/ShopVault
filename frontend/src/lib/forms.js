// Connects a react-hook-form field to a MUI TextField (ref, error state and helper text).
export const fieldProps = ({ register, formState: { errors } }, name, rules) => {
  const { ref, ...rest } = register(name, rules)

  return {
    ...rest,
    inputRef: ref,
    error: Boolean(errors[name]),
    helperText: errors[name]?.message,
  }
}

export const EMAIL_RULES = {
  required: 'Email is required',
  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
}

export const PASSWORD_RULES = {
  required: 'Password is required',
  validate: (value) =>
    (value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value)) ||
    'Use at least 8 characters with upper and lower case letters and a number',
}
