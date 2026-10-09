import { useDispatch, useSelector } from 'react-redux'
import { notify } from '../../lib/notify'
import { addToWishlist, removeFromWishlist, selectWishlistEntry } from './wishlistSlice'

// Save / unsave a product; used by product cards and the detail page.
export function useWishlistToggle(productId) {
  const dispatch = useDispatch()
  const entry = useSelector(selectWishlistEntry(productId))

  const toggle = () =>
    entry
      ? notify(dispatch(removeFromWishlist(entry._id)), 'Removed from wishlist')
      : notify(dispatch(addToWishlist(productId)), 'Saved to wishlist')

  return { saved: Boolean(entry), toggle }
}
