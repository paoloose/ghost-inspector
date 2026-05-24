import { useState } from 'react'
import { Card, CardHead, Btn } from './ui'
import StatusBadge from './StatusBadge'
import ReachMap from './ReachMap'
import { businesses, audits } from './data'

function BusinessList({ onSelect }) {
  const statusOrder = { auditing: 0, finished: 1, waiting: 2, enrolled: 3 }
  const sorted = [...businesses].sort((a, b) => statusOrder[a.status] - statusOrder[b.status])

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-gradient">Radar</h1>
          <p className="text-[13px] text-ink-3 mt-0.5">Negocios inmobiliarios escrapeados — México</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar negocio..."
              className="w-64 h-9 pl-9 pr-4 bg-bg-elev border border-line rounded-md text-[13px] text-ink placeholder:text-ink-3 focus:outline-none focus:border-brand/50 transition-colors"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <Btn variant="accent" size="sm">+ Nuevo Audit</Btn>
        </div>
      </div>

      {/* Reach Map */}
      <div className="mb-6">
        <ReachMap />
      </div>

      <div className="bg-bg-elev border border-line rounded-lg2 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line bg-bg">
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Negocio</th>
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Ubicación</th>
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Estado</th>
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Score</th>
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Último Audit</th>
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((biz) => (
              <tr
                key={biz.id}
                onClick={() => onSelect(biz)}
                className="border-b border-line/50 hover:bg-bg-card transition-colors cursor-pointer"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/20 flex items-center justify-center text-brand-light font-bold text-[11px]">
                      {biz.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-ink">{biz.name}</p>
                      <p className="text-[11px] text-ink-3">{biz.website}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-[13px] text-ink-2">{biz.location.city}, {biz.location.state}</td>
                <td className="px-5 py-4"><StatusBadge status={biz.status} /></td>
                <td className="px-5 py-4">
                  {biz.score !== null ? (
                    <span className={`text-[13px] font-bold tabular-nums ${biz.score >= 8 ? 'text-emerald-400' : biz.score >= 6 ? 'text-amber-400' : 'text-red-400'}`}>
                      {biz.score.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-[13px] text-ink-3">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-[13px] text-ink-2">
                  {biz.lastAuditAt ? new Date(biz.lastAuditAt).toLocaleDateString('es-MX') : '—'}
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="inline-flex items-center gap-1 text-[12px] text-brand-light hover:text-brand transition-colors">
                    Ver detalle <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ScoreBar({ label, value, max = 100 }) {
  const color = value >= 80 ? '#10B981' : value >= 50 ? '#F59E0B' : '#DC2626'
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] text-ink-2 capitalize">{label.replace(/([A-Z])/g, ' $1').trim()}</span>
        <span className="text-[12px] font-semibold text-ink tabular-nums">{value}</span>
      </div>
      <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(value / max * 100, 100)}%`, background: color }} />
      </div>
    </div>
  )
}

function ChannelBadge({ label, has }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${has ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
      {has ? '✓' : '✗'} {label}
    </span>
  )
}

function AuditItem({ audit, idx }) {
  const [open, setOpen] = useState(false)
  const dateStr = new Date(audit.createdAt).toLocaleString('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const severityColors = {
    bad: { bg: 'bg-accent-red/tint', text: 'text-red-400', border: 'border-red-500/20' },
    warn: { bg: 'bg-accent-amber/tint', text: 'text-amber-400', border: 'border-amber-500/20' },
    good: { bg: 'bg-accent-emerald/tint', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  }

  return (
    <div className="border border-line rounded-lg2 overflow-hidden mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-bg-elev hover:bg-bg-card transition-colors text-left"
      >
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${audit.score >= 7 ? 'bg-emerald-500/20 text-emerald-400' : audit.score >= 5 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
          {audit.score !== null ? audit.score.toFixed(1) : '—'}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-ink">Auditoría #{idx + 1}</p>
          <p className="text-[11px] text-ink-3">{dateStr} · {audit.totalSteps} pasos · {audit.model}</p>
        </div>
        <span className="text-[12px] text-ink-3">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 py-3 border-t border-line space-y-2">
          {audit.findings.map((f, i) => {
            const c = severityColors[f.severity]
            return (
              <div key={i} className={`rounded-md p-3 ${c.bg} border ${c.border}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${c.text}`}>{f.severity}</span>
                  <span className="text-[11px] text-ink-3">{f.category}</span>
                </div>
                <p className="text-[13px] font-semibold text-ink mb-1">{f.title}</p>
                <p className="text-[12px] text-ink-2 leading-relaxed mb-2">{f.description}</p>
                <p className="text-[11px] text-brand-light">→ {f.recommendation}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function BusinessDetail({ business, onBack, onNavigate }) {
  const [subTab, setSubTab] = useState('crawled')
  const bizAudits = audits.filter(a => a.businessId === business.id)
  const biz = business

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="flex items-center gap-1 text-[13px] text-ink-3 hover:text-ink transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          Radar
        </button>
        <span className="text-line">/</span>
        <span className="text-[13px] font-medium text-ink">{biz.name}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/20 flex items-center justify-center text-brand-light font-bold text-[20px]">
            {biz.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div>
            <h1 className="text-[20px] font-bold tracking-[-0.01em] text-ink">{biz.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <a href={biz.fullUrl} target="_blank" rel="noopener" className="text-[12px] text-brand-light hover:text-brand transition-colors">{biz.website}</a>
              <span className="text-line">|</span>
              <span className="text-[12px] text-ink-3">{biz.location.city}, {biz.location.country}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {biz.score !== null && (
            <span className={`text-[18px] font-bold tabular-nums ${biz.score >= 7 ? 'text-emerald-400' : biz.score >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
              {biz.score.toFixed(1)}
            </span>
          )}
          <StatusBadge status={biz.status} />
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-line">
        {[
          { key: 'crawled', label: 'Crawled Information' },
          { key: 'ghost', label: 'Ghost Audits' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`px-4 py-2.5 text-[13px] font-medium rounded-t-md relative transition-colors ${subTab === t.key ? 'text-ink' : 'text-ink-3 hover:text-ink-2'}`}
          >
            {t.label}
            {subTab === t.key && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand rounded-full" />}
          </button>
        ))}
      </div>

      {/* Crawled Information */}
      {subTab === 'crawled' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHead title="Performance" subtitle="Core Web Vitals" />
              <ScoreBar label="mobileSpeed" value={biz.crawlData.performance.mobileSpeed} />
              <ScoreBar label="desktopSpeed" value={biz.crawlData.performance.desktopSpeed} />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[12px] text-ink-2">FCP</span>
                <span className="text-[12px] font-semibold text-ink">{biz.crawlData.performance.firstContentfulPaint}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-ink-2">LCP</span>
                <span className="text-[12px] font-semibold text-ink">{biz.crawlData.performance.largestContentfulPaint}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-ink-2">CLS</span>
                <span className="text-[12px] font-semibold text-ink">{biz.crawlData.performance.cls}</span>
              </div>
            </Card>

            <Card>
              <CardHead title="Channels & Features" />
              <div className="flex flex-wrap gap-2 mb-4">
                <ChannelBadge label="WhatsApp" has={biz.crawlData.hasWhatsApp} />
                <ChannelBadge label="Email" has={biz.crawlData.hasEmail} />
                <ChannelBadge label="Phone" has={biz.crawlData.hasPhone} />
                <ChannelBadge label="Chatbot" has={biz.crawlData.hasChatbot} />
                <ChannelBadge label="Login" has={biz.crawlData.hasLogin} />
                <ChannelBadge label="Blog" has={biz.crawlData.hasBlog} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-[12px] text-ink-2">Pages crawled</span><span className="text-[12px] font-semibold text-ink">{biz.crawlData.pagesFound}</span></div>
                <div className="flex justify-between"><span className="text-[12px] text-ink-2">Images</span><span className="text-[12px] font-semibold text-ink">{biz.crawlData.totalImages}</span></div>
                <div className="flex justify-between"><span className="text-[12px] text-ink-2">Forms</span><span className="text-[12px] font-semibold text-ink">{biz.crawlData.formsDetected}</span></div>
                <div className="flex justify-between"><span className="text-[12px] text-ink-2">Properties</span><span className="text-[12px] font-semibold text-ink">{biz.crawlData.ux.propertyCount}</span></div>
              </div>
            </Card>

            <Card>
              <CardHead title="Trust Signals" />
              <div className="space-y-2">
                {Object.entries(biz.crawlData.trustSignals).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[12px] text-ink-2 capitalize">{key.replace(/has/g, '').replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className={`text-[12px] font-semibold ${val ? 'text-emerald-400' : 'text-red-400'}`}>{val ? 'Presente' : 'Ausente'}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-line">
                <p className="text-[10px] uppercase tracking-[0.1em] text-ink-3 mb-2">UX</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between"><span className="text-[12px] text-ink-2">Precios visibles</span><span className={`text-[12px] font-semibold ${biz.crawlData.ux.hasPricingVisible ? 'text-emerald-400' : 'text-red-400'}`}>{biz.crawlData.ux.hasPricingVisible ? 'Sí' : 'No'}</span></div>
                  <div className="flex justify-between"><span className="text-[12px] text-ink-2">Testimonios</span><span className={`text-[12px] font-semibold ${biz.crawlData.ux.hasTestimonials ? 'text-emerald-400' : 'text-red-400'}`}>{biz.crawlData.ux.hasTestimonials ? 'Sí' : 'No'}</span></div>
                  <div className="flex justify-between"><span className="text-[12px] text-ink-2">Tour virtual</span><span className={`text-[12px] font-semibold ${biz.crawlData.ux.hasVirtualTour ? 'text-emerald-400' : 'text-red-400'}`}>{biz.crawlData.ux.hasVirtualTour ? 'Sí' : 'No'}</span></div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHead title="SEO Snapshot" />
              <div className="space-y-2">
                <p className="text-[12px] text-ink-3">Title</p>
                <p className="text-[13px] text-ink font-medium">{biz.crawlData.seo.title}</p>
                <p className="text-[12px] text-ink-3">Description</p>
                <p className="text-[13px] text-ink-2">{biz.crawlData.seo.description}</p>
                <div className="flex gap-3 mt-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${biz.crawlData.seo.hasSchema ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>Schema: {biz.crawlData.seo.hasSchema ? 'OK' : 'Missing'}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${biz.crawlData.seo.hasOpenGraph ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>OG: {biz.crawlData.seo.hasOpenGraph ? 'OK' : 'Missing'}</span>
                </div>
              </div>
            </Card>

            <Card>
              <CardHead title="Content Analysis" />
              <div className="space-y-2">
                {Object.entries(biz.crawlData.contentAnalysis).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[13px] text-ink-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-[13px] font-semibold text-ink">{typeof val === 'boolean' ? (val ? 'Sí' : 'No') : val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-line">
                <p className="text-[10px] uppercase tracking-[0.1em] text-ink-3 mb-2">Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {biz.crawlData.seo.keywords.map(kw => (
                    <span key={kw} className="px-2 py-0.5 rounded bg-bg-elev border border-line text-[11px] text-ink-2">{kw}</span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Ghost Audits */}
      {subTab === 'ghost' && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[16px] font-bold text-ink">Auditorías Fantasma</h2>
              <p className="text-[12px] text-ink-3 mt-0.5">{bizAudits.length} auditorías completadas</p>
            </div>
            <Btn
              variant="accent"
              size="lg"
              onClick={() => onNavigate('audits', { preselect: biz })}
              className="shadow-glow"
            >
              <span className="mr-2">👻</span> Iniciar Nueva auditoría fantasma
            </Btn>
          </div>

          {bizAudits.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[14px] text-ink-3 mb-4">No hay auditorías previas para este negocio.</p>
              <Btn variant="accent" onClick={() => onNavigate('audits', { preselect: biz })}>
                <span className="mr-2">👻</span> Iniciar Primera auditoría fantasma
              </Btn>
            </div>
          ) : (
            <div>
              {bizAudits.map((audit, i) => (
                <AuditItem key={audit.id} audit={audit} idx={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Radar({ selectedBusiness, onSelectBusiness, onNavigate }) {
  if (selectedBusiness) {
    return (
      <BusinessDetail
        business={selectedBusiness}
        onBack={() => onSelectBusiness(null)}
        onNavigate={onNavigate}
      />
    )
  }
  return <BusinessList onSelect={onSelectBusiness} />
}
