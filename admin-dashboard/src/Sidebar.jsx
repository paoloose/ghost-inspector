const NAV_ITEMS = [
  { key: 'radar', label: 'Radar', icon: '◉' },
  { key: 'audits', label: 'Audits', icon: '◫' },
  { key: 'contacts', label: 'Contacts', icon: '✉' },
]

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="w-[240px] min-h-screen bg-bg border-r border-line flex flex-col sticky top-0 shrink-0">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-[14px] shadow-glow">
            G
          </div>
          <div>
            <h1 className="text-[14px] font-bold tracking-[-0.01em] text-ink leading-tight">Ghost Shopper</h1>
            <p className="text-[11px] text-ink-3 tracking-wide">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-bg-elev border border-line cursor-pointer hover:border-line-strong transition-colors">
          <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">MX</span>
          <span className="text-[13px] font-medium text-ink flex-1 truncate">México Inmobiliario</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-3"><path d="M6 9l6 6 6-6"/></svg>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">Overview</p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors mb-0.5 text-left ${
              active === item.key
                ? 'bg-brand/10 text-brand-light border border-brand/20'
                : 'text-ink-2 hover:text-ink hover:bg-bg-elev'
            }`}
          >
            <span className="w-5 text-center opacity-70">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-line">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white font-bold text-[11px]">
            DT
          </div>
          <div>
            <p className="text-[12px] font-semibold text-ink">Dream Team</p>
            <p className="text-[11px] text-ink-3">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
