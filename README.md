# ShopVault

A full-stack e-commerce app built with MongoDB, Express, React and Node. Shoppers can browse and filter products, keep a wishlist, manage a cart, place orders and leave reviews. Admins manage the catalogue and move orders through delivery.

## Features

**Shoppers**
- Sign up with email verification (6 digit code), sign in, password reset by email
- Browse products with search, category and brand filters, sorting and pagination
- Product pages with image gallery, stock status and customer reviews (one review per product, editable)
- Wishlist with personal notes, cart with live totals
- Checkout with saved addresses and payment method, order history, cancelling pending orders

**Admins**
- Add, edit, remove and restore products
- View every order and update its status (cancelling returns stock)

**Under the hood**
- Prices, discounts, shipping and tax are calculated on the server, never trusted from the client
- Stock is reserved atomically at checkout, so the last unit cannot be sold twice
- Requests are validated with Zod, sessions use httpOnly cookies, auth routes are rate limited
- Order addresses and items are stored as snapshots, so later edits never change past orders

## Tech stack

| Layer    | Tools                                                                  |
| -------- | ---------------------------------------------------------------------- |
| Frontend | React 18, Redux Toolkit, React Router 6, Material UI 5, React Hook Form |
| Backend  | Node.js, Express 4, Mongoose 8, Zod, Helmet, JSON Web Tokens           |
| Testing  | Node test runner + Supertest (API), Jest + Testing Library (UI)         |

## Getting started

You need Node.js 18+ and a MongoDB instance (local or Atlas).

```bash
# 1. API
cd backend
cp .env.example .env        # then fill in MONGO_URI and SECRET_KEY
npm install
npm run seed                # optional: demo products, users and orders
npm run dev                 # http://localhost:8000

# 2. Web app (in a second terminal)
cd frontend
cp .env.example .env
npm install
npm start                   # http://localhost:3000
```

### Demo accounts (created by `npm run seed`)

| Role    | Email               | Password    |
| ------- | ------------------- | ----------- |
| Shopper | demo@gmail.com      | Shop@1234   |
| Admin   | admin@example.com   | Admin@1234  |

The seed script wipes the collections it touches and refuses to run when `PRODUCTION=true`.

### Email in development

Verification codes and reset links are sent through Gmail. If `EMAIL` / `PASSWORD` are empty or rejected, the API prints the email to its console instead, so you can still sign up locally by copying the code from there. In production a failed send is reported as an error.

## Environment variables

**backend/.env** - see `backend/.env.example` for the full, commented list.

| Variable                            | Purpose                                              |
| ----------------------------------- | ---------------------------------------------------- |
| `MONGO_URI`                         | MongoDB connection string (required)                 |
| `SECRET_KEY`                        | Signs session tokens (required)                      |
| `ORIGIN`                            | Allowed frontend origin(s), comma separated (required) |
| `PRODUCTION`                        | `true` enables secure cross-site cookies             |
| `EMAIL`, `PASSWORD`                 | Gmail sender and app password                        |
| `COOKIE_EXPIRATION_DAYS`            | Session length (default 30)                          |
| `OTP_EXPIRATION_TIME`               | Verification code lifetime in ms (default 600000)    |
| `PASSWORD_RESET_EXPIRATION_MINUTES` | Reset link lifetime (default 30)                     |

**frontend/.env**

| Variable             | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `REACT_APP_BASE_URL` | API base URL, e.g. `http://localhost:8000`  |

## Scripts

| Where     | Command          | What it does                                           |
| --------- | ---------------- | ------------------------------------------------------ |
| backend   | `npm run dev`    | Start the API with nodemon                             |
| backend   | `npm start`      | Start the API                                          |
| backend   | `npm run seed`   | Reset and fill the database with demo data             |
| backend   | `npm test`       | Run API tests (uses `TEST_MONGO_URI`, default local `shopvault-test` DB, which it drops) |
| frontend  | `npm start`      | Start the dev server                                   |
| frontend  | `npm run build`  | Production build                                       |
| frontend  | `npm test`       | Run UI tests                                           |

## API overview

All routes except sign up, sign in and password recovery need a session cookie. Shop routes also need a verified email.

| Area      | Endpoints                                                                                       |
| --------- | ----------------------------------------------------------------------------------------------- |
| Auth      | `POST /auth/signup` `login` `logout` `verify-otp` `resend-otp` `forgot-password` `reset-password`, `GET /auth/check-auth` |
| Catalogue | `GET /products` (`q`, `brand`, `category`, `sort`, `order`, `page`, `limit`), `GET /products/:id`, `GET /brands`, `GET /categories` |
| Admin     | `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`, `PATCH /products/:id/restore`  |
| Cart      | `GET /cart`, `POST /cart`, `PATCH /cart/:id`, `DELETE /cart/:id`, `DELETE /cart`                |
| Wishlist  | `GET /wishlist`, `POST /wishlist`, `PATCH /wishlist/:id`, `DELETE /wishlist/:id`                |
| Addresses | `GET /address`, `POST /address`, `PATCH /address/:id`, `DELETE /address/:id`                    |
| Orders    | `POST /orders`, `GET /orders/mine`, `GET /orders/:id`, `PATCH /orders/:id/cancel`; admin: `GET /orders`, `PATCH /orders/:id/status` |
| Reviews   | `GET /reviews/product/:id`, `POST /reviews`, `PATCH /reviews/:id`, `DELETE /reviews/:id`        |

Errors always have the shape `{ "message": "..." }` with a matching HTTP status.

## Project structure

```
backend/
  config/        environment loading and shop constants (shipping, tax, limits)
  controllers/   request handlers
  middleware/    auth, validation, rate limiting, error handling
  models/        Mongoose schemas
  routes/        route definitions
  validators/    Zod schemas for every request body and query
  seed/          demo data
  tests/         API tests
frontend/src/
  components/    layout, navbar, route guards and shared UI
  features/      one folder per area: auth, products, cart, wishlist, orders, addresses, reviews, admin
  lib/           http client, formatting, form helpers
  store/         Redux store
```

## Deployment notes

- Backend: `backend/vercel.json` deploys the API as a Vercel Node function. Set the same variables as `.env.example`, with `PRODUCTION=true` and `ORIGIN` set to your frontend URL.
- Frontend: `npm run build` and serve `frontend/build` as a single-page app (all routes fall back to `index.html`).
- Use a Gmail app password for `PASSWORD`, and never commit a real `.env`.

## License

MIT, see [LICENSE](LICENSE).
