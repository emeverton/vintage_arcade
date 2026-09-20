"use client"
import { useEffect, useRef, useState } from "react"
import styles from "./brand.module.css"

/** Readable identification when an existing asset fails to decode.
 * A textual fallback is not a replacement or recreation of the approved logo.
 */
export default function PreviewBrand() {
  const [unavailable, setUnavailable] = useState(false)
  const image = useRef<HTMLImageElement>(null)
  useEffect(() => {
    // A resource may already have failed before React hydrates the server HTML.
    if (image.current?.complete && image.current.naturalWidth === 0) setUnavailable(true)
  }, [])
  return <div className={styles.brand} data-testid="vintage-brand" data-brand-status={unavailable ? "text-fallback" : "image"}>
    {unavailable
      ? <span className={styles.wordmark} role="img" aria-label="Vintage Arcade, identificação textual provisória"><span>VINTAGE</span><span>ARCADE</span></span>
      : <img ref={image} src="/images/vintage-arcade-logo.webp" width="76" height="76" alt="Vintage Arcade" loading="eager" onError={() => setUnavailable(true)} />}
  </div>
}
