/** Identificação textual provisória. O WebP do repositório está truncado
 * (RIFF declara ~25 KB; arquivo tem ~7,5 KB) e não deve ser carregado na LP
 * até existir original íntegro aprovado. Não recria o logotipo comercial.
 */
export default function BrandMark({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <div
      className={`brand-mark brand-mark-${size} ${className}`.trim()}
      data-testid="vintage-brand"
      data-brand-status="text-fallback"
    >
      <span className="brand-wordmark" role="img" aria-label="Vintage Arcade, identificação textual provisória">
        <span>VINTAGE</span>
        <span>ARCADE</span>
      </span>
    </div>
  )
}
