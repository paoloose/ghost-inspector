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

const BACKEND_URL = 'http://localhost:8001'

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

function ConfigureStep({ selectedBiz, params, onChange }) {
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
                className={`flex flex-col p-4 rounded-xl border text-left transition-all ${
                  params.taskType === t.key
                    ? 'border-brand bg-brand/5'
                    : 'border-line bg-bg-elev hover:border-line-strong hover:bg-bg-card'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[18px]">{t.icon}</span>
                  <span className="text-[14px] font-semibold text-ink">{t.label}</span>
                </div>
                <p className="text-[12px] text-ink-3 leading-relaxed">{t.desc}</p>
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

  useEffect(() => {
    if (!job?.events_ws_url) return
    const ws = new WebSocket(job.events_ws_url)
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
  }, [job?.events_ws_url])

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
              {job?.mjpeg_url ? (
                <img src={job.mjpeg_url} alt="Live browser" className="w-full h-full object-contain" onError={e => { e.target.style.display = 'none' }} />
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
      const res = await fetch(`${BACKEND_URL}/api/v1/run`, {
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
          <p className="text-[11px] text-ink-3 mt-2">Asegúrate de que el backend esté corriendo en {BACKEND_URL}</p>
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
          <ConfigureStep selectedBiz={selectedBiz} params={params} onChange={setParams} />
          <div className="mt-6 flex justify-end">
            <Btn variant="accent" size="md" onClick={() => setStep(3)}>
              Revisar y lanzar →
            </Btn>
          </div>
        </>
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
