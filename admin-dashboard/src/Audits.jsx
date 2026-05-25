import { useState, useEffect, useRef } from 'react'
import { Card, CardHead, Btn } from './ui'
import { businesses } from './data'

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
  whatsapp: `You are Ghost Shopper, an AI mystery shopper acting as a potential real estate buyer in Mexico City. Your mission is to evaluate how easily and effectively a prospect can initiate a WhatsApp conversation with this agency.

CONTEXT ABOUT THE AGENCY:
{context}

YOUR PERSONA:
- Name: {name}
- Looking for: a 2-bedroom apartment in the agency's service area
- Urgency: medium (comparing 3 agencies this week)

STEP-BY-STEP TASKS:
1. Navigate to the homepage. Scroll through the entire page and note EVERY WhatsApp-related element you see (floating buttons, inline links, QR codes, property card buttons, sticky bars, footer links).
2. For each WhatsApp element found, click it and document: exact text/label, position on page, whether it opens WhatsApp Web or a pre-filled message, and what the pre-filled message says.
3. Check if WhatsApp links appear on individual property listing pages (not just homepage).
4. Evaluate discoverability: could a first-time visitor find WhatsApp within 5 seconds? Is the button above the fold? Is it visible on mobile?
5. Check if the WhatsApp button has a professional appearance (brand color, correct icon, hover state) or looks generic/placed as an afterthought.
6. Attempt to interact with any WhatsApp chat widget if present (not just a redirect link). Does it show online status, auto-reply, or business hours?
7. Document any broken links, 404s, or WhatsApp numbers that look personal rather than business.
8. SUMMARIZE: rate WhatsApp accessibility 1-10, list all locations where it appears, note the pre-filled message quality, and identify the single biggest missed opportunity.`,
  forms: `You are Ghost Shopper, an AI mystery shopper acting as a potential real estate buyer in Mexico City. Your mission is to stress-test every lead-capture form on this agency's website as if your money depended on it.

CONTEXT ABOUT THE AGENCY:
{context}

YOUR PERSONA:
- Name: {name}
- Email: {email}
- Phone: {phone}
- Budget: $3.5M MXN
- Looking for: 2-bedroom apartment, preferably with parking
- Timeline: 2-3 months

STEP-BY-STEP TASKS:
1. Navigate to the homepage. Find EVERY form on the page: contact form, property inquiry form, newsletter signup, callback request, mortgage calculator (if it requires input), schedule visit, etc.
2. For each form, document: number of fields, which are required, whether field labels are clear, placeholder text quality, and whether the form uses autocomplete attributes (name, email, tel).
3. Fill out each form with your persona data. Deliberately trigger validation errors (empty required fields, invalid email format, phone too short) to test error messages. Are they helpful and specific?
4. Submit each form successfully. Document: confirmation message (on-page toast, redirect, email), estimated response time promise, and whether a tracking/CRM ID is shown.
5. Test mobile UX: on a narrow viewport, are form fields large enough (min 44px touch target)? Is the keyboard type appropriate per field (email keyboard for email, tel keyboard for phone)?
6. Check if forms are protected by CAPTCHA or honeypots — legitimate users should not be annoyed.
7. Look for multi-step forms. If present, evaluate progress indicators, ability to go back, and data persistence if the user refreshes.
8. Check if forms appear on property detail pages (inquiry for a specific property) vs generic contact.
9. SUMMARIZE: rate overall form UX 1-10, list each form with its conversion friction score, identify the highest-impact fix, and note any form that appears broken or abandoned.`,
  call: `You are Ghost Shopper, an AI mystery shopper acting as a potential real estate buyer in Mexico City. Your mission is to evaluate how discoverable and actionable the agency's phone contact is across their entire digital presence.

CONTEXT ABOUT THE AGENCY:
{context}

YOUR PERSONA:
- Name: {name}
- Preference: would rather call than text for a first contact
- Device: primarily mobile

STEP-BY-STEP TASKS:
1. Navigate to the homepage. Within 3 seconds, try to find a phone number. Document: where you found it (header, hero, footer, sticky bar, CTA button), how prominent it is, and whether it uses a click-to-call tel: link.
2. Scroll through the entire homepage. Map EVERY phone number instance: its position, formatting (with/without country code, spaces, dashes), whether it's clickable, and whether it shows hours of availability.
3. Navigate to the "Contacto" or "Contact" page. Is the phone number the primary CTA or buried below a form? Is there more than one number (sales, rentals, support)?
4. Check individual property listing pages. Do they show an agent's direct number or only a generic office line?
5. On mobile viewport: is the phone number thumb-reachable? Is the tel: link working? Does it prompt the native dialer correctly?
6. Evaluate the phone number's trust signals: does it look like a business line (Mexico City area code 55) or a personal cellphone? Is there a WhatsApp Business badge next to it?
7. Check if there's a "Llamada gratuita" or "Click to call" button with a clear visual icon.
8. Look in the footer, header, and any sticky bottom bars for phone CTAs.
9. SUMMARIZE: rate phone accessibility 1-10, list every location where a phone number appears, note formatting quality, identify if mobile click-to-call works, and highlight the biggest missed opportunity.`,
  everything: `You are Ghost Shopper, an AI-powered mystery shopper evaluating a Mexican real estate agency's complete digital buyer journey. Act as a serious prospect with $3.5M MXN budget looking for a 2-bedroom apartment within 2-3 months. Your goal is to identify every friction point, missing trust signal, and conversion killer on their website.

CONTEXT ABOUT THE AGENCY:
{context}

PHASE 1 — FIRST IMPRESSION (Homepage)
- Load the homepage. Time the visual readiness subjectively (does it feel instant, sluggish, or broken?).
- Evaluate the hero section: is there a clear value proposition, a primary CTA, and social proof within the first viewport?
- Check if the agency's location, years of experience, and team size are visible without scrolling.
- Look for trust badges (AMPI, ISO, years in business) and client count statements.

PHASE 2 — PROPERTY DISCOVERY (Listings)
- Navigate to the property listings/catalog page.
- Check: filters (price, bedrooms, location, amenities), sorting options, total result count, and pagination/infinite scroll.
- Evaluate property cards: do they show price, photos, location, key specs (m², bedrooms, bathrooms, parking), and a clear CTA?
- Click into a property detail page. Is there a photo gallery, video, virtual tour, map, similar properties, and agent info?

PHASE 3 — CONTACT CHANNELS (Lead Capture)
- Test ALL contact mechanisms: forms (fill with Name={name}, Email={email}, Phone={phone}), WhatsApp buttons (note pre-filled messages), phone numbers (click-to-call), email links, and chatbots.
- For each channel, document: ease of discovery, number of clicks to initiate contact, quality of response promise, and mobile UX.

PHASE 4 — TRUST & CREDIBILITY
- Look for: client testimonials with photos/names, Google/Facebook reviews embedded, team/agent photos with credentials, AMPI certification, privacy policy, terms of service, and SSL indicator.
- Check if the "About" page tells a compelling story or is just generic filler.

PHASE 5 — MOBILE EXPERIENCE
- Evaluate on narrow viewport: hamburger menu clarity, text readability without zooming, button sizes (min 44px), form usability, image loading, and whether CTAs are thumb-reachable.
- Test horizontal scrolling issues and popups that break mobile UX.

PHASE 6 — PERFORMANCE & SEO OBSERVATION
- Note visual load speed of images, whether lazy loading is used, font loading flashes, and any layout shifts while scrolling.
- Check page titles and meta descriptions in the tab/browser inspector for uniqueness and relevance.

PHASE 7 — COMPETITIVE GAPS
- Based on the context provided, identify what this agency is missing compared to best-in-class real estate websites in Mexico.

FINAL REPORT STRUCTURE:
Provide a structured summary with:
1. Overall Digital Readiness Score (1-10)
2. Top 3 Strengths
3. Top 3 Critical Issues (with business impact)
4. Quick Wins (changes that would improve conversions within a week)
5. Channel-specific scores: Forms (/10), WhatsApp (/10), Phone (/10), Trust (/10), Mobile (/10), Listings (/10)`,
}

// API base is same-origin (backend serves static + API on same host/port)
// In dev, Vite proxy forwards to localhost:8001

function StepIndicator({ current, total, onStepClick }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            onClick={() => onStepClick(i + 1)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${
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
      <p className="text-[13px] text-ink-3 mb-6">Elige la inmobiliaria que quieres auditar</p>
      <div className="grid grid-cols-2 gap-4">
        {businesses.map(biz => (
          <button
            key={biz.id}
            onClick={() => onSelect(biz)}
            className={`flex items-start gap-4 p-5 rounded-xl border text-left transition-all ${
              selected?.id === biz.id
                ? 'border-brand bg-brand/5 shadow-glow'
                : 'border-line bg-bg-elev hover:border-line-strong hover:bg-bg-card'
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/20 flex items-center justify-center text-brand-light font-bold text-[13px] shrink-0">
              {biz.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-ink truncate">{biz.name}</p>
              <p className="text-[12px] text-ink-3 mt-1">{biz.location.city} · {biz.website}</p>
              <div className="flex items-center gap-2 mt-2">
                {biz.score !== null && (
                  <span className={`text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded ${biz.score >= 7 ? 'bg-emerald-500/10 text-emerald-400' : biz.score >= 5 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                    {biz.score.toFixed(1)}
                  </span>
                )}
                <span className="text-[11px] text-ink-3">{biz.crawlData.pagesFound} páginas</span>
              </div>
            </div>
            {selected?.id === biz.id && (
              <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-white text-[12px] shrink-0 mt-1">✓</div>
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
            <h3 className="text-[15px] font-bold text-ink">Editar prompt: {taskLabel}</h3>
            <p className="text-[12px] text-ink-3 mt-0.5">Vista previa del prompt que recibe el agente. Esto es solo visual — el backend usa su propia plantilla.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-bg-elev border border-line flex items-center justify-center text-ink-3 hover:text-ink transition-colors text-[16px]">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <textarea
            readOnly
            value={prompt}
            rows={24}
            className="w-full px-4 py-3 bg-bg-elev border border-line rounded-lg text-[12px] text-ink-2 font-mono leading-relaxed resize-none focus:outline-none"
          />
        </div>
        <div className="px-6 py-4 border-t border-line flex items-center justify-between">
          <p className="text-[11px] text-ink-3">Los cambios aquí no afectan el backend. El servidor usa TASK_TEMPLATES hardcodeadas.</p>
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
      <p className="text-[13px] text-ink-3 mb-6">Ajusta los parámetros del bot de auditoría</p>

      <div className="space-y-5">
        {/* Task Type */}
        <div>
          <label className="block text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-3 mb-3">Tipo de auditoría</label>
          <div className="grid grid-cols-2 gap-3">
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
                  <span className="text-[14px] font-semibold text-ink">{t.label}</span>
                  {params.taskType === t.key && (
                    <span className="ml-auto text-[10px] font-semibold text-brand bg-brand/10 px-1.5 py-0.5 rounded">Por defecto</span>
                  )}
                </div>
                <p className="text-[12px] text-ink-3 leading-relaxed">{t.desc}</p>
                <div className="mt-3 pt-3 border-t border-line/50">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditPrompt(t.key); }}
                    className="text-[11px] font-semibold text-brand-light hover:text-brand transition-colors flex items-center gap-1"
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
            className="w-full h-11 px-4 bg-bg-elev border border-line rounded-lg text-[13px] text-ink focus:outline-none focus:border-brand/50 transition-colors"
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
            className="w-full px-4 py-3 bg-bg-elev border border-line rounded-lg text-[13px] text-ink focus:outline-none focus:border-brand/50 transition-colors resize-none font-mono leading-relaxed"
            placeholder="Pega aquí la información scrapeada del negocio..."
          />
          <p className="text-[11px] text-ink-3 mt-1.5">Este contexto se inyecta en el prompt del agente para que tome decisiones informadas.</p>
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
              <p className="text-[13px] font-semibold text-ink">{v.label}</p>
              <p className="text-[11px] text-ink-3 mt-0.5">{v.dim}</p>
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
      <p className="text-[13px] text-ink-3 mb-6">Verifica los parámetros antes de iniciar la auditoría</p>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <Card padding="p-5">
          <CardHead title="Negocio" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand/30 to-brand/10 border border-brand/20 flex items-center justify-center text-brand-light font-bold text-[13px]">
              {business.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="text-[14px] font-semibold text-ink">{business.name}</p>
              <p className="text-[12px] text-ink-3">{business.website}</p>
            </div>
          </div>
        </Card>
        <Card padding="p-5">
          <CardHead title="Auditoría" />
          <div className="flex items-center gap-2">
            <span className="text-[18px]">{TASK_TYPES.find(t => t.key === params.taskType)?.icon}</span>
            <div>
              <p className="text-[14px] font-semibold text-ink">{taskLabel}</p>
              <p className="text-[12px] text-ink-3">{params.viewport} · Headless</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-5" padding="p-5">
        <CardHead title="Contexto del agente" />
        <div className="bg-bg-elev rounded-lg p-4 border border-line max-h-48 overflow-y-auto">
          <pre className="text-[12px] text-ink-2 font-mono leading-relaxed whitespace-pre-wrap">{params.context}</pre>
        </div>
      </Card>

      <Btn variant="accent" size="lg" className="w-full py-4 text-[16px] shadow-glow hover:shadow-[0_0_30px_rgba(91,61,245,.25)] transition-shadow" onClick={onRun}>
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
  const wsUrl = job?.id
    ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/v1/events/${job.id}`
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
            <span className="text-[12px] text-ink-3">{connected ? 'Conectado al stream en vivo' : 'Desconectado'}</span>
            <span className="text-line">|</span>
            <span className="text-[12px] text-ink-3">{stepCount} pasos</span>
          </div>
        </div>
        {(isDone || isError) && (
          <Btn variant="secondary" size="sm" onClick={onReset}>Nueva auditoría</Btn>
        )}
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* MJPEG Stream */}
        <div className="col-span-3">
          <Card className="overflow-hidden" padding="p-0">
            <div className="bg-bg-elev px-4 py-2.5 border-b border-line flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Live Browser Stream</span>
              <span className="text-[10px] text-ink-3 font-mono">MJPEG</span>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {job?.id ? (
                <img src={`/mjpeg/v1/watch/${job.id}`} alt="Live browser" className="w-full h-full object-contain" onError={e => { e.target.style.display = 'none' }} />
              ) : (
                <p className="text-[13px] text-ink-3">Esperando stream...</p>
              )}
            </div>
          </Card>
        </div>

        {/* Events Log */}
        <div className="col-span-2">
          <Card className="h-full flex flex-col" padding="p-0">
            <div className="bg-bg-elev px-4 py-2.5 border-b border-line flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">Agent Event Log</span>
              <span className="text-[10px] text-ink-3 font-mono">{events.length} events</span>
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[11px]" style={{ maxHeight: 400 }}>
              {events.length === 0 && <p className="text-ink-3 italic py-4 text-center">Esperando eventos del agente...</p>}
              {events.map((e, i) => (
                <div key={i} className="border-l-2 pl-2.5 py-1">
                  {e.type === 'step' && (
                    <>
                      <span className="text-brand-light font-semibold">Step {e.step_number}</span>
                      <span className="text-ink-3 ml-2">{e.action}</span>
                      {e.thought && <p className="text-ink-2 mt-0.5 opacity-60 truncate">{e.thought}</p>}
                    </>
                  )}
                  {e.type === 'done' && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-2.5">
                      <span className="text-emerald-400 font-bold">✓ Completado</span>
                      <p className="text-ink-2 mt-1 text-[12px]">{e.result || 'Auditoría finalizada exitosamente'}</p>
                    </div>
                  )}
                  {e.type === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-md p-2.5">
                      <span className="text-red-400 font-bold">✗ Error</span>
                      <p className="text-ink-2 mt-1 text-[12px]">{e.reason}</p>
                    </div>
                  )}
                  {e.type === 'heartbeat' && <span className="text-ink-3 opacity-40">· heartbeat</span>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-ink-3">Progreso</span>
          <span className="text-[12px] font-semibold text-ink">{stepCount} pasos ejecutados</span>
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
    <div className="px-8 py-8 max-w-[960px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-[-0.02em] text-gradient">Audits</h1>
          <p className="text-[13px] text-ink-3 mt-0.5">Ghost Shopper — Auditorías automáticas con IA</p>
        </div>
        {step > 1 && !job && (
          <button onClick={() => setStep(step - 1)} className="text-[13px] text-ink-3 hover:text-ink transition-colors">
            ← Paso anterior
          </button>
        )}
      </div>

      {!job && <StepIndicator current={step} total={3} onStepClick={goToStep} />}

      {error && (
        <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-[13px] text-red-400 font-semibold">Error al iniciar auditoría</p>
          <p className="text-[12px] text-ink-2 mt-1">{error}</p>
          <p className="text-[11px] text-ink-3 mt-2">Asegúrate de que el backend esté corriendo</p>
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
            <p className="text-[16px] font-semibold text-ink">Iniciando auditoría fantasma...</p>
            <p className="text-[13px] text-ink-3 mt-2">Conectando con el backend y lanzando el agente</p>
          </div>
        </div>
      )}
    </div>
  )
}
