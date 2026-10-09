import EmptyState from '../components/EmptyState'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')

  return <EmptyState title="Page not found" message="The page you are looking for does not exist or has moved." actionLabel="Go to the shop" actionTo="/" />
}
