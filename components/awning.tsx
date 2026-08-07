// Toldo listrado com babado — a assinatura visual do Mercadinho do Lito.
// stripe define a cor das listras (a outra é sempre branca).

export function Awning({
  stripe = '#D93425',
  className = '',
}: {
  stripe?: string
  className?: string
}) {
  return (
    <svg
      aria-hidden
      className={`block w-full ${className}`}
      height="22"
      preserveAspectRatio="none"
      style={{ height: 22 }}
    >
      <defs>
        <pattern id={`awn-${stripe.replace('#', '')}`} width="48" height="22" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="24" height="11" fill={stripe} />
          <rect x="24" y="0" width="24" height="11" fill="#FFFDF8" />
          <circle cx="12" cy="11" r="11" fill={stripe} />
          <circle cx="36" cy="11" r="11" fill="#FFFDF8" />
        </pattern>
      </defs>
      <rect width="100%" height="22" fill={`url(#awn-${stripe.replace('#', '')})`} />
    </svg>
  )
}
