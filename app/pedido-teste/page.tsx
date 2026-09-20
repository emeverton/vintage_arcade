import { notFound } from "next/navigation"
import { previewServerConfig } from "../../lib/vintage-preview-server"
import CheckoutPreview from "./preview"
export const dynamic = "force-dynamic"
export const metadata = { title: "Vintage Arcade | Checkout de teste", robots: { index: false, follow: false } }
export default function Page() {
  if (!previewServerConfig()) notFound()
  return <CheckoutPreview />
}
