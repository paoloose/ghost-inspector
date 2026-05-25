/* Ghost Shopper — Admin Dashboard Design System Primitives */

export function Card({ children, className = '', padding = 'px-6 py-6', hover = false }) {
  return (
    <div className={`bg-bg-card rounded-lg2 border border-line ${padding} ${hover ? 'hover:border-line-strong transition-colors' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function CardHead({ title, subtitle, children }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
        {subtitle && <p className="text-[14px] text-ink-3 mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

export function Btn({ variant = 'primary', size = 'md', children, onClick, className = '' }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-md transition-all active:scale-[0.97]'
  const sizes = {
    sm: 'px-3.5 h-9 text-[14px]',
    md: 'px-4.5 h-10 text-[14px]',
    lg: 'px-6 h-11 text-[15px]',
  }
  const variants = {
    primary:   'bg-ink text-bg hover:bg-white',
    secondary: 'bg-bg-elev border border-line text-ink hover:border-line-strong',
    accent:    'bg-brand text-white hover:bg-brand-ink shadow-glow',
    ghost:     'text-ink-2 hover:text-ink hover:bg-bg-elev',
    danger:    'bg-accent-red text-white hover:bg-red-700',
  }
  return (
    <button onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

export function Pill({ children, dotColor, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[14px] font-medium rounded-full border border-line bg-bg-elev ${className}`}>
      {dotColor && <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />}
      {children}
    </span>
  )
}

export function Tag({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-bg-elev text-ink-2 border-line',
    brand:   'bg-brand-tint text-brand-light border-brand/20',
    good:    'bg-accent-emerald/tint text-emerald-400 border-emerald-500/20',
    warn:    'bg-accent-amber/tint text-amber-400 border-amber-500/20',
    bad:     'bg-accent-red/tint text-red-400 border-red-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-[13px] font-semibold tracking-[0.02em] rounded-md border ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}

export function Delta({ value, className = '' }) {
  const isPositive = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[14px] font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'} ${className}`}>
      {isPositive ? '▲' : '▼'} {Math.abs(value)}%
    </span>
  )
}
