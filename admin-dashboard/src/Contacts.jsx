import { useState } from 'react'
import { Card, CardHead } from './ui'
import { contacts, businesses as businessList } from './data'

function Sparkline({ data, color = '#5b3df5', fill = true, width = 120, height = 32 }) {
  if (!data || data.length < 2) return <div className="text-[14px] text-ink-3">—</div>
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  })
  const pathD = `M ${points.join(' L ')}`
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkfill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={areaD} fill={`url(#sparkfill-${color.replace('#', '')})`} />}
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ScoreMeter({ score, label, size = 56 }) {
  const pct = Math.min(Math.max(score, 0), 10) / 10
  const circumference = 2 * Math.PI * ((size - 8) / 2)
  const offset = circumference * (1 - pct)
  const color = score >= 7 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={(size - 8) / 2} fill="none" stroke="#1f2337" strokeWidth="4" />
          <circle
            cx={size / 2} cy={size / 2} r={(size - 8) / 2}
            fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[14px] font-bold text-ink tabular-nums">{score.toFixed(1)}</span>
        </div>
      </div>
      <span className="text-[14px] text-ink-3 mt-1.5 uppercase tracking-wide">{label}</span>
    </div>
  )
}

function MiniBarChart({ data, color = '#5b3df5', max, height = 40 }) {
  if (!data || !data.length) return null
  const m = max || Math.max(...data)
  return (
    <div className="flex items-end gap-[3px]" style={{ height }}>
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all"
          style={{
            height: `${(v / m) * 100}%`,
            backgroundColor: color,
            opacity: 0.4 + (i / data.length) * 0.6,
            minWidth: 4,
          }}
        />
      ))}
    </div>
  )
}

function StatCard({ title, value, sub, sparklineData, barData, score, color = '#5b3df5' }) {
  return (
    <Card padding="p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3 mb-1">{title}</p>
          <p className="text-[22px] font-bold text-ink tabular-nums tracking-tight">{value}</p>
          {sub && <p className="text-[14px] text-ink-3 mt-0.5">{sub}</p>}
        </div>
        {score !== undefined && <ScoreMeter score={score} label="Score" />}
      </div>
      {sparklineData && (
        <div className="mt-2">
          <Sparkline data={sparklineData} color={color} />
        </div>
      )}
      {barData && (
        <div className="mt-2">
          <MiniBarChart data={barData} color={color} />
        </div>
      )}
    </Card>
  )
}

function EmailThread({ contact, selected, onSelect }) {
  const business = businessList.find(b => b.id === contact.businessId)
  const last = contact.emails[contact.emails.length - 1]

  return (
    <button
      onClick={() => onSelect(contact)}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        selected?.id === contact.id
          ? 'border-brand bg-brand/5'
          : 'border-line bg-bg-elev hover:border-line-strong hover:bg-bg-card'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/20 flex items-center justify-center text-brand-light font-bold text-[14px] shrink-0">
          {contact.name.split(' ').map(w => w[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-semibold text-ink">{contact.name}</p>
            <span className="text-[14px] text-ink-3 tabular-nums">{last.date}</span>
          </div>
          <p className="text-[13px] text-ink-3 truncate">{business?.name}</p>
          <p className="text-[13px] text-ink-2 mt-1.5 truncate">{last.subject}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[12px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${last.status === 'responded' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {last.status}
            </span>
            <span className="text-[13px] text-ink-3">{contact.emails.length} emails</span>
          </div>
        </div>
      </div>
    </button>
  )
}

function EmailDetail({ contact }) {
  const business = businessList.find(b => b.id === contact.businessId)

  return (
    <Card className="h-full flex flex-col" padding="p-0">
      <div className="border-b border-line p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/20 flex items-center justify-center text-brand-light font-bold text-[14px]">
              {contact.name.split(' ').map(w => w[0]).join('')}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-ink">{contact.name}</p>
              <p className="text-[13px] text-ink-3">{business?.name} · {contact.email}</p>
            </div>
          </div>
          <span className={`text-[12px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded ${contact.score >= 7 ? 'bg-emerald-500/10 text-emerald-400' : contact.score >= 5 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
            Score: {contact.score}
          </span>
        </div>

        {/* Contact Score Breakdown */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-line">
          <ScoreMeter score={contact.responseTime} label="Response" size={48} />
          <ScoreMeter score={contact.personalization} label="Personal" size={48} />
          <ScoreMeter score={contact.clarity} label="Clarity" size={48} />
          <ScoreMeter score={contact.cta} label="CTA" size={48} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {contact.emails.map((email, idx) => (
          <div key={idx} className={`flex ${email.direction === 'sent' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${email.direction === 'sent' ? 'bg-brand/10 border border-brand/20 rounded-br-sm' : 'bg-bg-elev border border-line rounded-bl-sm'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold text-ink-2 uppercase tracking-wide">{email.direction}</span>
                <span className="text-[12px] text-ink-3 tabular-nums">{email.date}</span>
              </div>
              <p className="text-[14px] font-semibold text-ink mb-2">{email.subject}</p>
              <p className="text-[14px] text-ink-2 leading-relaxed whitespace-pre-wrap">{email.body}</p>
              {email.aiScore !== undefined && (
                <div className="mt-3 pt-3 border-t border-line/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-ink-3">AI Score</span>
                    <span className="text-[12px] font-bold text-brand-light">{email.aiScore}/10</span>
                  </div>
                  <div className="w-full h-1.5 bg-bg-elev rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-brand rounded-full" style={{ width: `${(email.aiScore / 10) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function Contacts() {
  const [selected, setSelected] = useState(contacts[0])

  // Generate mock trend data for sparklines
  const responseTimes = [2.5, 3.1, 2.8, 3.5, 2.1, 2.9, 3.2, 2.7]
  const personalization = [6.5, 7.0, 6.8, 7.2, 6.9, 7.5, 7.1, 7.3]
  const weeklyEmails = [12, 18, 15, 22, 19, 25, 21, 28]
  const replyRates = [45, 52, 48, 61, 55, 63, 58, 67]

  const avgResponse = (contacts.reduce((s, c) => s + c.responseTime, 0) / contacts.length).toFixed(1)
  const avgPersonalization = (contacts.reduce((s, c) => s + c.personalization, 0) / contacts.length).toFixed(1)
  const totalEmails = contacts.reduce((s, c) => s + c.emails.length, 0)
  const avgScore = (contacts.reduce((s, c) => s + c.score, 0) / contacts.length).toFixed(1)

  return (
    <div className="px-9 py-9 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-gradient">Contacts</h1>
          <p className="text-[14px] text-ink-3 mt-0.5">Ghost Shopper — Evaluación de respuestas por email</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-ink-3">{contacts.length} negocios evaluados</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6 mb-7 mt-5">
        <StatCard
          title="Avg Response Time"
          value={`${avgResponse}h`}
          sub="Meta: < 2h"
          sparklineData={responseTimes}
          score={parseFloat(avgResponse)}
          color="#10b981"
        />
        <StatCard
          title="Avg Personalization"
          value={avgPersonalization}
          sub="de 10 puntos"
          sparklineData={personalization}
          score={parseFloat(avgPersonalization)}
          color="#5b3df5"
        />
        <StatCard
          title="Total Emails"
          value={totalEmails}
          sub="en los últimos 30 días"
          barData={weeklyEmails}
          color="#f59e0b"
        />
        <StatCard
          title="Avg Score"
          value={avgScore}
          sub="de 10 puntos"
          sparklineData={replyRates}
          score={parseFloat(avgScore)}
          color="#06b6d4"
        />
      </div>

      {/* Email Threads */}
      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-2 space-y-6">
          <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-ink-3 mb-2">Conversaciones</p>
          {contacts.map(c => (
            <EmailThread key={c.id} contact={c} selected={selected} onSelect={setSelected} />
          ))}
        </div>
        <div className="col-span-3">
          {selected && <EmailDetail contact={selected} />}
        </div>
      </div>
    </div>
  )
}
