import { useState, useEffect, useRef } from 'react'
import { Card, CardHead, Btn } from './ui'
import { businesses } from './data'

function ActionBadge({ action }) {
  const colors = {
    navigate: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    click: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    type: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    scroll: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    screenshot: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  }
  const normalized = (action || 'unknown').toLowerCase().replace(/\s+/g, '_')
  const matched = Object.keys(colors).find(k => normalized.includes(k))
  const colorClass = matched ? colors[matched] : 'bg-ink-3/10 text-ink-3 border-ink-3/20'
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${colorClass}`}>
      {action || 'unknown'}
    </span>
  )
}

function HeartbeatGroup({ events, startIndex }) {
  // Count consecutive heartbeats from startIndex backward
  let count = 0
  for (let i = startIndex; i >= 0; i--) {
    if (events[i].type === 'heartbeat') count++
    else break
  }
  if (count > 1) {
    return <span className="text-ink-3 opacity-30 text-[10px]">· heartbeat ×{count}</span>
  }
  return <span className="text-ink-3 opacity-30 text-[10px]">· heartbeat</span>
}

const TASK_TYPES = [
  {
    key: 'whatsapp',
    label: 'WhatsApp Contact',
    icon: '💬',
    desc: 'Evalúa el contacto por WhatsApp: enlaces, botones flotantes, mensajes predefinidos y facilidad de acceso.',
  },
  {
    key: 'forms',
    label: 'Forms Contact',
    icon: '📝',
    desc: 'Prueba todos los formularios de contacto: campos, validación, UX, confirmaciones y funcionamiento móvil.',
  },
  {
    key: 'call',
    label: 'Number Calling',
    icon: '📞',
    desc: 'Audita números telefónicos: visibilidad, enlaces tel:, formato, accesibilidad y click-to-call.',
  },
  {
    key: 'everything',
    label: 'Everything',
    icon: '👻',
    desc: 'Auditoría completa: homepage, navegación, propiedades, canales, trust signals, mobile UX y performance.',
  },
]

// Prompt previews shown in the UI editor — these mirror the backend TASK_TEMPLATES
const PROMPT_PREVIEWS = {
  whatsapp: `You are Ghost Shopper, an AI mystery shopper acting as a potential real estate buyer in Mexico City. Your mission is to extract the agency's WhatsApp contact number and document everything about it.

CONTEXT ABOUT THE AGENCY:
{context}

YOUR PERSONA:
- Name: {name}
- Looking for: a 2-bedroom apartment in the agency's service area
- Urgency: medium (comparing 3 agencies this week)

CRITICAL INSTRUCTION:
You are already on the website. DO NOT search for it on Google. DO NOT navigate away from the site. Focus entirely on the current website.

STEP-BY-STEP TASKS:
1. Scroll through the entire page and note EVERY WhatsApp-related element you see (floating buttons, inline links, QR codes, sticky bars, footer links).
2. Extract the EXACT WhatsApp number(s) found on the site. Document in this format:
   - Number: +52 ...
   - Location on page: [header/footer/floating button/etc]
   - Pre-filled message (if any): "..."
3. Evaluate discoverability: could a first-time visitor find WhatsApp within 5 seconds?
4. Check if the WhatsApp button looks professional (brand color, correct icon) or generic.
5. Document any broken links or WhatsApp numbers that look personal rather than business.
6. Once you have extracted the WhatsApp number, REPORT IT and end your task. Do NOT click the WhatsApp button or open WhatsApp Web.

FINAL OUTPUT FORMAT:
WHATSAPP_NUMBER: [the exact number with country code]
LOCATIONS_FOUND: [list]
PRE_FILLED_MESSAGE: [message text or "none"]
DISCOVERABILITY_SCORE: [1-10]
PROFESSIONAL_APPEARANCE: [good/fair/poor]
ISSUES: [any problems found]`,
  forms: `You are Ghost Shopper, an AI mystery shopper acting as a potential real estate buyer in Mexico City. Your mission is to fill out and submit EVERY lead-capture form on this agency's website using made-up Spanish client data.

CONTEXT ABOUT THE AGENCY:
{context}

YOUR PERSONA (use this exact info for ALL forms):
- Name: Marco Antonio Herrera
- Email: pflores.fisi22@gmail.com
- Phone: {phone}
- Budget: $3.5M MXN
- Looking for: departamento de 2 recámaras con estacionamiento
- Timeline: 2-3 meses
- Message: "Hola, estoy interesado en comprar un departamento de 2 recámaras. ¿Podrían contactarme con opciones disponibles?"

CRITICAL INSTRUCTION:
You are already on the website. DO NOT search for it on Google. DO NOT navigate away from the site. Focus entirely on the current website.

STEP-BY-STEP TASKS:
1. Find EVERY form on the page: contact form, property inquiry, newsletter signup, callback request, schedule visit, etc.
2. For each form, fill ALL fields with the persona data above. Write in Spanish.
3. Trigger validation errors deliberately (empty fields, bad email) to test error messages.
4. Submit each form successfully. Wait for confirmation.
5. Document for each form:
   - Form name/location
   - Number of fields
   - Confirmation message received
   - Any errors or friction

FINAL OUTPUT FORMAT:
FORMS_FOUND: [number]
FORMS_SUBMITTED: [number]
FORM_DETAILS:
1. [Name]: [fields count] fields, confirmation: [yes/no], message: "..."`,
  call: `You are Ghost Shopper, an AI mystery shopper acting as a potential real estate buyer in Mexico City. Your mission is to extract the agency's phone number and document everything about it.

CONTEXT ABOUT THE AGENCY:
{context}

YOUR PERSONA:
- Name: {name}
- Preference: would rather call than text for a first contact
- Device: primarily mobile

CRITICAL INSTRUCTION:
You are already on the website. DO NOT search for it on Google. DO NOT navigate away from the site. Focus entirely on the current website.

STEP-BY-STEP TASKS:
1. Within 3 seconds, try to find a phone number. Document where you found it (header, hero, footer, sticky bar, CTA button).
2. Scroll through the entire page. Map EVERY phone number instance with exact formatting.
3. Check the "Contacto" page for additional numbers (sales, rentals, support).
4. Evaluate the number's trust signals: does it look like a business line (area code 55) or personal?
5. Once you have extracted the phone number(s), REPORT THEM and end your task. Do NOT click tel: links or make actual calls.

FINAL OUTPUT FORMAT:
PHONE_NUMBER: [the exact number with country code]
LOCATIONS_FOUND: [list]
FORMATTING: [good/bad — e.g. +52 55 XXXX XXXX vs raw digits]
CLICK_TO_CALL: [yes/no]
BUSINESS_LINE: [yes/no — area code 55?]
ISSUES: [any problems found]`,
  everything: `You are Ghost Shopper, an AI-powered mystery shopper evaluating a Mexican real estate agency's complete digital buyer journey. Act as a serious prospect with $3.5M MXN budget looking for a 2-bedroom apartment within 2-3 months.

CONTEXT ABOUT THE AGENCY:
{context}

YOUR PERSONA:
- Name: Marco Antonio Herrera
- Email: pflores.fisi22@gmail.com
- Phone: {phone}
- Budget: $3.5M MXN
- Looking for: departamento de 2 recámaras con estacionamiento
- Timeline: 2-3 meses

CRITICAL INSTRUCTION:
You are already on the website. DO NOT search for it on Google. DO NOT navigate away from the site. Focus entirely on the current website.

PHASE 1 — FIRST IMPRESSION (Homepage)
- Evaluate the hero section: clear value proposition, primary CTA, social proof within first viewport?
- Check agency location, years of experience, team size visible without scrolling.
- Look for trust badges (AMPI, ISO, years in business).

PHASE 2 — PROPERTY DISCOVERY (Listings)
- Navigate to listings/catalog. Check filters, sorting, pagination.
- Evaluate property cards: price, photos, location, specs (m², recámaras, baños, estacionamiento), CTA?
- Click a property detail. Photo gallery, video, virtual tour, map, similar properties, agent info?

PHASE 3 — CONTACT CHANNELS (Lead Capture)
- FORMS: Find all forms. Fill with persona data (Marco Antonio Herrera, pflores.fisi22@gmail.com, {phone}). Submit. Document confirmations.
- WHATSAPP: Extract exact WhatsApp number, pre-filled message, placement. Do NOT click it.
- PHONE: Extract exact phone number(s), formatting, click-to-call. Do NOT click tel: links.
- EMAIL: Find email addresses on site.
- CHATBOT: Test if present and functional.

PHASE 4 — TRUST & CREDIBILITY
- Client testimonials with photos/names? Google/Facebook reviews? Team/agent photos? AMPI cert?
- Privacy policy, terms, SSL indicator?

PHASE 5 — MOBILE EXPERIENCE
- Hamburger menu, text readability, button sizes (min 44px), form usability, thumb-reachable CTAs.

PHASE 6 — PERFORMANCE & SEO
- Visual load speed, lazy loading, layout shifts.
- Page titles and meta descriptions unique and relevant?

PHASE 7 — COMPETITIVE GAPS
- What's missing vs best-in-class real estate sites in Mexico?

FINAL REPORT STRUCTURE:
1. Overall Digital Readiness Score (1-10)
2. Top 3 Strengths
3. Top 3 Critical Issues (with business impact)
4. Quick Wins
5. Channel-specific scores: Forms (/10), WhatsApp (/10), Phone (/10), Trust (/10), Mobile (/10), Listings (/10)
6. Extracted Contact Info:
   - WhatsApp: ...
   - Phone: ...
   - Email: ...`,
}

// API base is same-origin (backend serves static + API on same host/port)
// In dev, Vite proxy forwards to localhost:8001

function StepIndicator({ current, total, onStepClick }) {
  return (
    <div id="step-indicator" className="flex items-center gap-6 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            onClick={() => onStepClick(i + 1)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold transition-all ${
              i + 1 === current
                ? 'bg-brand text-white shadow-glow'
                : i + 1 < current
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-pointer hover:bg-emerald-500/30'
                : 'bg-bg-elev text-ink-3 border border-line cursor-pointer hover:border-line-strong hover:text-ink-2'
            }`}
          >
            {i + 1 < current ? '✓' : i + 1}
          </button>
          {i < total - 1 && (
            <div className={`w-16 h-[2px] rounded ${i + 1 < current ? 'bg-emerald-500/40' : 'bg-line'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function SelectBusinessStep({ selected, onSelect }) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-[18px] font-bold text-ink mb-1">Seleccionar Negocio</h2>
      <p className="text-[14px] text-ink-3 mb-6">Elige la inmobiliaria que quieres auditar</p>
      <div className="grid grid-cols-2 gap-4">
        {businesses.map(biz => (
          <button
            key={biz.id}
            onClick={() => onSelect(biz)}
            className={`flex items-start gap-6 p-5 rounded-xl border text-left transition-all ${
              selected?.id === biz.id
                ? 'border-brand bg-brand/5 shadow-glow'
                : 'border-line bg-bg-elev hover:border-line-strong hover:bg-bg-card'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/20 flex items-center justify-center text-brand-light font-bold text-[14px] shrink-0">
              {biz.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-ink truncate">{biz.name}</p>
              <p className="text-[14px] text-ink-3 mt-1">{biz.location.city} · {biz.website}</p>
              <div className="flex items-center gap-6 mt-2">
                {biz.score !== null && (
                  <span className={`text-[14px] font-bold tabular-nums px-1.5 py-0.5 rounded ${biz.score >= 7 ? 'bg-emerald-500/10 text-emerald-400' : biz.score >= 5 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                    {biz.score.toFixed(1)}
                  </span>
                )}
                <span className="text-[14px] text-ink-3">{biz.crawlData.pagesFound} páginas</span>
              </div>
            </div>
            {selected?.id === biz.id && (
              <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-white text-[14px] shrink-0 mt-1">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function PromptEditorModal({ taskType, onClose }) {
  const prompt = PROMPT_PREVIEWS[taskType] || ''
  const taskLabel = TASK_TYPES.find(t => t.key === taskType)?.label || taskType
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[720px] max-h-[85vh] bg-bg-card border border-line rounded-2xl shadow-glow flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div>
            <h3 className="text-[14px] font-bold text-ink">Editar prompt: {taskLabel}</h3>
            <p className="text-[14px] text-ink-3 mt-0.5">Vista previa del prompt que recibe el agente. Esto es solo visual — el backend usa su propia plantilla.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-bg-elev border border-line flex items-center justify-center text-ink-3 hover:text-ink transition-colors text-[18px]">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <textarea
            readOnly
            value={prompt}
            rows={24}
            className="w-full px-6 py-5 bg-bg-elev border border-line rounded-lg text-[14px] text-ink-2 font-mono leading-relaxed resize-none focus:outline-none"
          />
        </div>
        <div className="px-6 py-4 border-t border-line flex items-center justify-between">
          <p className="text-[14px] text-ink-3">Los cambios aquí no afectan el backend. El servidor usa TASK_TEMPLATES hardcodeadas.</p>
          <Btn variant="secondary" size="sm" onClick={onClose}>Cerrar</Btn>
        </div>
      </div>
    </div>
  )
}

function ConfigureStep({ selectedBiz, params, onChange, onEditPrompt }) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-[18px] font-bold text-ink mb-1">Configurar Ghost Shopper</h2>
      <p className="text-[14px] text-ink-3 mb-6">Ajusta los parámetros del bot de auditoría</p>

      <div className="space-y-6">
        {/* Task Type */}
        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-3 mb-3">Tipo de auditoría</label>
          <div id="task-type-grid" className="grid grid-cols-2 gap-3">
            {TASK_TYPES.map(t => (
              <button
                key={t.key}
                onClick={() => onChange({ ...params, taskType: t.key })}
                className={`flex flex-col p-4 rounded-xl border text-left transition-all relative ${
                  params.taskType === t.key
                    ? 'border-brand bg-brand/5'
                    : 'border-line bg-bg-elev hover:border-line-strong hover:bg-bg-card'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[18px]">{t.icon}</span>
                  <span className="text-[15px] font-semibold text-ink">{t.label}</span>
                  {params.taskType === t.key && (
                    <span className="ml-auto text-[14px] font-semibold text-brand bg-brand/10 px-1.5 py-0.5 rounded">Por defecto</span>
                  )}
                </div>
                <p className="text-[13px] text-ink-3 leading-relaxed">{t.desc}</p>
                <div className="mt-3 pt-3 border-t border-line/50">
                    <button
                    id="edit-prompt-btn"
                    onClick={(e) => { e.stopPropagation(); onEditPrompt(t.key); }}
                    className="text-[14px] font-semibold text-brand-light hover:text-brand transition-colors flex items-center gap-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Editar prompt
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* URL */}
        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-3 mb-2">URL de inicio</label>
          <input
            type="text"
            value={params.url}
            onChange={e => onChange({ ...params, url: e.target.value })}
            className="w-full h-11 px-4 bg-bg-elev border border-line Mpx] text-ink focus:outline-none focus:border-brand/50 transition-colors"
          />
        </div>

        {/* Context */}
        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-3 mb-2">
            Contexto del negocio <span className="text-ink-3 normal-case font-normal">— información scrapeada que el agente recibirá</span>
          </label>
          <textarea
            value={params.context}
            onChange={e => onChange({ ...params, context: e.target.value })}
            rows={8}
            className="w-full px-6 py-5 bg-bg-elev border border-line Mpx] text-ink focus:outline-none focus:border-brand/50 transition-colors resize-none font-mono leading-relaxed"
            placeholder="Pega aquí la información scrapeada del negocio..."
          />
          <p className="text-[14px] text-ink-3 mt-1.5">Este contexto se inyecta en el prompt del agente para que tome decisiones informadas.</p>
        </div>

        {/* Viewport */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'desktop', label: 'Desktop', dim: '1280×720' },
            { key: 'mobile', label: 'Mobile', dim: '390×844' },
            { key: 'tablet', label: 'Tablet', dim: '820×1180' },
          ].map(v => (
            <button
              key={v.key}
              onClick={() => onChange({ ...params, viewport: v.key })}
              className={`p-3 rounded-lg border text-center transition-all ${
                params.viewport === v.key
                  ? 'border-brand bg-brand/5'
                  : 'border-line bg-bg-elev hover:border-line-strong'
              }`}
            >
              <p className="text-[14px] font-semibold text-ink">{v.label}</p>
              <p className="text-[14px] text-ink-3 mt-0.5">{v.dim}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReviewStep({ business, params, onRun, job, onReset }) {
  if (job) {
    return <RunningView job={job} onReset={onReset} />
  }

  const taskLabel = TASK_TYPES.find(t => t.key === params.taskType)?.label || params.taskType

  return (
    <div className="animate-fade-in">
      <h2 className="text-[18px] font-bold text-ink mb-1">Revisar y Lanzar</h2>
      <p className="text-[14px] text-ink-3 mb-6">Verifica los parámetros antes de iniciar la auditoría</p>

      <div className="grid grid-cols-2 gap-6 mb-5">
        <Card padding="p-5">
          <CardHead title="Negocio" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/20 flex items-center justify-center text-brand-light font-bold text-[14px]">
              {business.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-ink">{business.name}</p>
              <p className="text-[14px] text-ink-3">{business.website}</p>
            </div>
          </div>
        </Card>
        <Card padding="p-5">
          <CardHead title="Auditoría" />
          <div className="flex items-center gap-2">
            <span className="text-[14px]">{TASK_TYPES.find(t => t.key === params.taskType)?.icon}</span>
            <div>
              <p className="text-[14px] font-semibold text-ink">{taskLabel}</p>
              <p className="text-[14px] text-ink-3">{params.viewport} · Headless</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-5" padding="p-5">
        <CardHead title="Contexto del agente" />
        <div className="bg-bg-elev rounded-lg p-4 border border-line max-h-48 overflow-y-auto">
          <pre className="text-[14px] text-ink-2 font-mono leading-relaxed whitespace-pre-wrap">{params.context}</pre>
        </div>
      </Card>

      <Btn id="launch-btn" variant="accent" size="lg" className="w-full py-4 text-[14px] shadow-glow hover:shadow-[0_0_30px_rgba(91,61,245,.25)] transition-shadow" onClick={onRun}>
        <span className="mr-2 text-[20px]">👻</span> Iniciar auditoría fantasma
      </Btn>
    </div>
  )
}

function RunningView({ job, onReset }) {
  const [events, setEvents] = useState([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const logRef = useRef(null)

  // Build WebSocket URL from current page origin so it works behind any proxy
  const jobId = job?.job_id || job?.id
  const wsUrl = jobId
    ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/v1/events/${jobId}`
    : null

  useEffect(() => {
    if (!wsUrl) return
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws
    ws.onopen = () => setConnected(true)
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setEvents(prev => [...prev, data])
      if (data.type === 'done' || data.type === 'error') ws.close()
    }
    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)
    return () => ws.close()
  }, [wsUrl])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [events])

  const isDone = events.some(e => e.type === 'done')
  const isError = events.some(e => e.type === 'error')
  const stepCount = events.filter(e => e.type === 'step').length

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[18px] font-bold text-ink">Auditoría en progreso</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-[13px] text-ink-3">{connected ? 'Conectado al stream en vivo' : 'Desconectado'}</span>
            <span className="text-line">|</span>
            <span className="text-[13px] text-ink-3">{stepCount} pasos</span>
          </div>
        </div>
        {(isDone || isError) && (
          <Btn variant="secondary" size="sm" onClick={onReset}>Nueva auditoría</Btn>
        )}
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* MJPEG Stream */}
        <div className="col-span-3">
          <Card id="live-stream" className="overflow-hidden" padding="p-0">
            <div className="bg-bg-elev px-4 py-2.5 border-b border-line flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">Live Browser Stream</span>
              <span className="text-[11px] text-ink-3 font-mono">MJPEG</span>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {jobId ? (
                <img src={`/mjpeg/v1/watch/${jobId}`} alt="Live browser" className="w-full h-full object-contain" onError={e => { e.target.style.display = 'none' }} />
              ) : (
                <p className="text-[14px] text-ink-3">Esperando stream...</p>
              )}
            </div>
          </Card>
        </div>

        {/* Events Log */}
        <div className="col-span-2">
          <Card className="h-full flex flex-col" padding="p-0">
            <div className="bg-bg-elev px-4 py-2.5 border-b border-line flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">Agent Event Log</span>
              <span className="text-[11px] text-ink-3 font-mono">{events.length} events</span>
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[12px]" style={{ maxHeight: 400 }}>
              {events.length === 0 && <p className="text-ink-3 italic py-4 text-center">Esperando eventos del agente...</p>}
              {events.map((e, i) => {
                // Collapse consecutive heartbeats into one — skip all but the last in a run
                if (e.type === 'heartbeat') {
                  const nextIsHeartbeat = events[i + 1]?.type === 'heartbeat'
                  if (nextIsHeartbeat) return null
                  let count = 1
                  for (let j = i - 1; j >= 0; j--) {
                    if (events[j].type === 'heartbeat') count++
                    else break
                  }
                  return (
                    <div key={i} className="border-l-2 pl-2.5 py-1">
                      <span className="text-ink-3 opacity-30 text-[10px]">· heartbeat {count > 1 ? `×${count}` : ''}</span>
                    </div>
                  )
                }
                return (
                  <div key={i} className="border-l-2 pl-2.5 py-1">
                    {e.type === 'step' && (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-brand-light font-semibold">Step {e.step_number}</span>
                          <ActionBadge action={e.action} />
                          {e.url && (
                            <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-ink-3 hover:text-brand-light truncate max-w-[140px]" title={e.url}>
                              {(() => { try { return new URL(e.url).pathname } catch { return e.url } })()}
                            </a>
                          )}
                        </div>
                        {e.thought && (
                          <div className="bg-bg-elev rounded px-2 py-1.5 border border-line/50 mt-1">
                            <p className="text-ink-2 leading-relaxed whitespace-pre-wrap">{e.thought}</p>
                          </div>
                        )}
                        {e.action_details && Object.keys(e.action_details).length > 0 && (
                          <details className="mt-1">
                            <summary className="text-[10px] text-ink-3 cursor-pointer hover:text-ink-2 select-none">Detalles de la acción</summary>
                            <pre className="mt-1 text-[10px] text-ink-3 bg-bg-elev rounded p-2 border border-line/50 overflow-x-auto">
                              {JSON.stringify(e.action_details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </>
                    )}
                    {e.type === 'tool_call' && (
                      <div className="bg-brand/10 border border-brand/20 rounded-md p-2.5">
                        <span className="text-brand-light font-bold">
                          {e.tool === 'extract_phone' && '📞 Teléfono extraído'}
                          {e.tool === 'extract_whatsapp' && '💬 WhatsApp extraído'}
                          {e.tool === 'extract_email' && '✉️ Email extraído'}
                          {!['extract_phone', 'extract_whatsapp', 'extract_email'].includes(e.tool) && `🔧 ${e.tool}`}
                        </span>
                        <p className="text-ink-2 mt-1 text-[12px] font-mono">
                          {e.data?.number || e.data?.email || JSON.stringify(e.data)}
                        </p>
                      </div>
                    )}
                    {e.type === 'done' && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-2.5">
                        <span className="text-emerald-400 font-bold">✓ Completado</span>
                        <p className="text-ink-2 mt-1 text-[13px]">{e.result || 'Auditoría finalizada exitosamente'}</p>
                      </div>
                    )}
                    {e.type === 'error' && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-md p-2.5">
                        <span className="text-red-400 font-bold">✗ Error</span>
                        <p className="text-ink-2 mt-1 text-[13px]">{e.reason}</p>
                      </div>
                    )}
                    {e.type === 'thinking' && (
                      <div className="bg-purple-500/5 border border-purple-500/10 rounded-md p-2.5">
                        <span className="text-purple-400 font-semibold text-[10px] uppercase tracking-wider">🧠 Pensando</span>
                        <p className="text-ink-2 mt-1 text-[12px] leading-relaxed whitespace-pre-wrap">{e.thought}</p>
                      </div>
                    )}
                    {e.type === 'url_change' && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-blue-400">🔗 URL</span>
                        <span className="text-ink-3 truncate">{e.url}</span>
                      </div>
                    )}
                    {e.type === 'status' && (
                      <div className="flex items-center gap-2 text-[11px] text-ink-3">
                        <span className="text-amber-400">📡</span>
                        <span>{e.message}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-ink-3">Progreso</span>
          <span className="text-[13px] font-semibold text-ink">{stepCount} pasos ejecutados</span>
        </div>
        <div className="w-full h-2 bg-bg-elev rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isError ? 'bg-red-400' : isDone ? 'bg-emerald-400' : 'bg-brand'}`}
            style={{ width: `${Math.min((stepCount / 20) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function Audits({ preselectedBusiness, onNavigate }) {
  const [step, setStep] = useState(1)
  const [selectedBiz, setSelectedBiz] = useState(preselectedBusiness || null)
  const [params, setParams] = useState({
    url: preselectedBusiness?.fullUrl || 'https://',
    taskType: 'everything',
    context: preselectedBusiness?.context || '',
    viewport: 'desktop',
  })
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingPrompt, setEditingPrompt] = useState(null)

  useEffect(() => {
    if (preselectedBusiness) {
      setSelectedBiz(preselectedBusiness)
      setParams(p => ({ ...p, url: preselectedBusiness.fullUrl, context: preselectedBusiness.context || '' }))
      setStep(3)
    }
  }, [preselectedBusiness])

  const goToStep = (s) => {
    if (s === 1) { setStep(1); setJob(null); }
    else if (s === 2 && selectedBiz) { setStep(2); setJob(null); }
    else if (s === 3 && selectedBiz) { setStep(3); }
  }

  const handleRun = async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/v1/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: params.url,
          task_type: params.taskType,
          context: params.context,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
      setJob(data)
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setJob(null); setError(null); setStep(1); setSelectedBiz(null)
    setParams({ url: 'https://', taskType: 'everything', context: '', viewport: 'desktop' })
  }

  return (
    <div className="px-9 py-9 max-w-[960px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-gradient">Audits</h1>
          <p className="text-[14px] text-ink-3 mt-0.5">Ghost Shopper — Auditorías automáticas con IA</p>
        </div>
        {step > 1 && !job && (
          <button onClick={() => setStep(step - 1)} className="text-[14px] text-ink-3 hover:text-ink transition-colors">
            ← Paso anterior
          </button>
        )}
      </div>

      {!job && <StepIndicator current={step} total={3} onStepClick={goToStep} />}

      {error && (
        <div className="mb-7 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-[14px] text-red-400 font-semibold">Error al iniciar auditoría</p>
          <p className="text-[14px] text-ink-2 mt-1">{error}</p>
          <p className="text-[14px] text-ink-3 mt-2">Asegúrate de que el backend esté corriendo</p>
        </div>
      )}

      {step === 1 && !job && (
        <>
          <SelectBusinessStep selected={selectedBiz} onSelect={(b) => { setSelectedBiz(b); setParams(p => ({ ...p, url: b.fullUrl, context: b.context || '' })); }} />
          <div className="mt-6 flex justify-end">
            <Btn variant="accent" size="md" onClick={() => selectedBiz && setStep(2)} className={!selectedBiz ? 'opacity-50 cursor-not-allowed' : ''}>
              Continuar →
            </Btn>
          </div>
        </>
      )}

      {step === 2 && !job && (
        <>
          <ConfigureStep selectedBiz={selectedBiz} params={params} onChange={setParams} onEditPrompt={setEditingPrompt} />
          <div className="mt-6 flex justify-end">
            <Btn variant="accent" size="md" onClick={() => setStep(3)}>
              Revisar y lanzar →
            </Btn>
          </div>
        </>
      )}

      {editingPrompt && (
        <PromptEditorModal taskType={editingPrompt} onClose={() => setEditingPrompt(null)} />
      )}

      {step === 3 && (
        <ReviewStep
          business={selectedBiz}
          params={params}
          onRun={handleRun}
          job={job}
          onReset={handleReset}
        />
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-bg-card border border-line rounded-xl p-8 text-center shadow-glow">
            <div className="w-12 h-12 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[14px] font-semibold text-ink">Iniciando auditoría fantasma...</p>
            <p className="text-[14px] text-ink-3 mt-2">Conectando con el backend y lanzando el agente</p>
          </div>
        </div>
      )}
    </div>
  )
}
