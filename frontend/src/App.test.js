import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material'
import { ToastContainer } from 'react-toastify'
import theme from './theme'

// A tiny in-memory stand-in for the API, so whole screens can render without a server.
jest.mock('./lib/http', () => {
  const brand = { _id: 'b1', name: 'Acme' }
  const category = { _id: 'c1', name: 'phones' }
  const product = {
    _id: 'p1',
    title: 'Pocket Phone',
    description: 'A very capable phone for everyday use.',
    price: 100,
    finalPrice: 90,
    discountPercentage: 10,
    stockQuantity: 7,
    thumbnail: 'https://example.com/t.jpg',
    images: ['https://example.com/1.jpg'],
    brand,
    category,
    isDeleted: false,
  }
  const address = { _id: 'a1', type: 'Home', street: '1 Main St', city: 'Pune', state: 'MH', postalCode: '411001', country: 'India', phoneNumber: '9876543210' }

  const state = { user: null, cart: [], orders: [] }
  const summary = () => {
    const subtotal = state.cart.reduce((sum, line) => sum + line.product.finalPrice * line.quantity, 0)
    return { subtotal, shipping: state.cart.length ? 5.55 : 0, tax: state.cart.length ? 5 : 0, total: state.cart.length ? subtotal + 10.55 : 0 }
  }
  const cart = () => ({ items: state.cart, summary: summary() })
  const fail = (status, message) => Promise.reject({ status, message })
  const ok = (data) => Promise.resolve({ data })

  const http = {
    __state: state,
    get: jest.fn((url) => {
      if (url === '/auth/check-auth') return state.user ? ok(state.user) : fail(401, 'Please sign in to continue')
      if (url === '/brands') return ok([brand])
      if (url === '/categories') return ok([category])
      if (url === '/products') return ok({ items: [product], total: 1, page: 1, limit: 12 })
      if (url === '/products/p1') return ok(product)
      if (url.startsWith('/reviews/product/')) return ok({ items: [], summary: { count: 0, average: 0, counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } } })
      if (url === '/cart') return ok(cart())
      if (url === '/wishlist') return ok([])
      if (url === '/address') return ok([address])
      if (url === '/orders/mine') return ok(state.orders)
      if (url === '/orders') return ok({ items: [], total: 0, page: 1, limit: 15 })
      return fail(404, `unmocked GET ${url}`)
    }),
    post: jest.fn((url, body) => {
      if (url === '/auth/login') {
        if (body.password !== 'Secret123') return fail(401, 'Incorrect email or password')
        state.user = { _id: 'u1', name: 'Demo User', email: body.email, isVerified: true, isAdmin: body.email.startsWith('admin') }
        return ok(state.user)
      }
      if (url === '/cart') {
        state.cart = [{ _id: 'l1', product, quantity: body.quantity }]
        return ok(cart())
      }
      if (url === '/orders') {
        const order = { _id: '65c2658db53f820728d0745a', item: state.cart.map((l) => ({ product: l.product, quantity: l.quantity, unitPrice: l.product.finalPrice })), address: [address], status: 'Pending', paymentMode: body.paymentMode, ...summary(), createdAt: new Date().toISOString() }
        state.orders = [order]
        state.cart = []
        return ok(order)
      }
      return fail(404, `unmocked POST ${url}`)
    }),
    patch: jest.fn(() => fail(404, 'unmocked PATCH')),
    delete: jest.fn(() => fail(404, 'unmocked DELETE')),
  }
  return { http, setUnauthorizedHandler: jest.fn() }
})

jest.setTimeout(30000)

const App = require('./App').default
const { store } = require('./store')
const { http } = require('./lib/http')

const renderAt = (path) =>
  render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
        <ToastContainer />
      </ThemeProvider>
    </Provider>
  )

const signIn = async (user, email = 'demo@example.com') => {
  await user.type(await screen.findByLabelText(/email/i), email)
  await user.type(screen.getByLabelText(/password/i), 'Secret123')
  await user.click(screen.getByRole('button', { name: /sign in/i }))
}

test('guests are sent to the sign in page and bad credentials show an error', async () => {
  const user = userEvent.setup()
  renderAt('/cart')

  expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument()

  await user.type(screen.getByLabelText(/email/i), 'demo@example.com')
  await user.type(screen.getByLabelText(/password/i), 'wrong')
  await user.click(screen.getByRole('button', { name: /sign in/i }))

  expect(await screen.findByText(/incorrect email or password/i)).toBeInTheDocument()
})

test('shopper can sign in, add a product, check out and see the order', async () => {
  http.__state.user = null
  const user = userEvent.setup()
  renderAt('/login')

  await signIn(user)

  // storefront
  expect(await screen.findByText('Pocket Phone')).toBeInTheDocument()
  expect(screen.getByText('$90.00')).toBeInTheDocument()

  // product page
  await user.click(screen.getByText('Pocket Phone'))
  expect(await screen.findByRole('heading', { name: 'Pocket Phone', level: 1 })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /increase quantity/i }))
  await user.click(screen.getByRole('button', { name: /^add to cart$/i }))

  await waitFor(() => expect(screen.getByLabelText(/cart, 2 items/i)).toBeInTheDocument())

  // cart
  await user.click(screen.getByLabelText(/cart, 2 items/i))
  expect(await screen.findByRole('heading', { name: /your cart/i })).toBeInTheDocument()
  expect(screen.getByText('$190.55')).toBeInTheDocument()

  // checkout
  await user.click(screen.getByRole('button', { name: /go to checkout/i }))
  expect(await screen.findByText(/delivery address/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /place order/i }))

  // order confirmation
  http.get.mockImplementationOnce(() => Promise.resolve({ data: http.__state.orders[0] }))
  expect(await screen.findByText(/thank you, your order has been placed/i)).toBeInTheDocument()
  expect(screen.getByText(/#28D0745A/)).toBeInTheDocument()
})

test('admins land on the product manager and cannot open the storefront cart', async () => {
  http.__state.user = null
  http.__state.cart = []
  const user = userEvent.setup()
  const { unmount } = renderAt('/login')
  await signIn(user, 'admin@example.com')

  expect(await screen.findByRole('heading', { name: 'Products', level: 1 })).toBeInTheDocument()
  const table = await screen.findByRole('table')
  expect(within(table).getByText('Pocket Phone')).toBeInTheDocument()
  unmount()
})
