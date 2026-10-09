import { http } from '../../lib/http'

export const fetchProducts = (params) => http.get('/products', { params }).then((res) => res.data)
export const fetchProduct = (id) => http.get(`/products/${id}`).then((res) => res.data)
