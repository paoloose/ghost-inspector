const NAV_ITEMS = [
  { key: 'radar', label: 'Radar', icon: '◉' },
  { key: 'audits', label: 'Audits', icon: '◫' },
  { key: 'contacts', label: 'Contacts', icon: '✉' },
]

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside id="sidebar" className="w-[260px] min-h-screen bg-bg border-r border-line flex flex-col sticky top-0 shrink-0">
      <div className="px-6 pt-7 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-[16px] shadow-glow">
            G
          </div>
          <div>
            <h1 className="text-[16px] font-bold tracking-[-0.01em] text-ink leading-tight">Ghost Shopper</h1>
            <p className="text-[13px] text-ink-3 tracking-wide">Admin Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pt-2">
        <p className="px-3 mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3">Overview</p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[15px] font-medium transition-colors mb-0.5 text-left ${
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

      <div className="px-5 py-5 border-t border-line">
        <button
          onClick={() => {
            localStorage.removeItem('ghostshopper-tour-seen')
            localStorage.removeItem('ghostshopper-audits-tour-seen')
            localStorage.removeItem('ghostshopper-detail-tour-ramirez-vazquez-001')
            localStorage.removeItem('ghostshopper-detail-tour-pendry-mexico-002')
            window.location.reload()
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[14px] text-ink-3 hover:text-ink hover:bg-bg-elev transition-colors mb-2"
        >
          <span>❓</span>
          <span>Ver guías de inicio</span>
        </button>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white font-bold text-[13px]">
            DT
          </div>
          <div>
            <p className="text-[14px] font-semibold text-ink">Dream Team</p>
            <p className="text-[13px] text-ink-3">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
