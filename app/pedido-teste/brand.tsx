import styles from "./brand.module.css"

/** The repository WebP is truncated (7,513 bytes vs 25,662 in its RIFF header).
 * Chromium may report naturalWidth despite painting no logo. Quarantine it in
 * this preview until an intact approved source is supplied and visually tested.
 * This is a textual identifier, not a recreated or repaired commercial logo.
 */
export default function PreviewBrand() {
  return <div className={styles.brand} data-testid="vintage-brand" data-brand-status="text-fallback">
    <span className={styles.wordmark} role="img" aria-label="Vintage Arcade, identificação textual provisória"><span>VINTAGE</span><span>ARCADE</span></span>
  </div>
}
