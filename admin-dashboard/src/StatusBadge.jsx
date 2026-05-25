import Tooltip from './Tooltip'

const STATUS_CONFIG = {
  auditing: {
    label: 'Auditing',
    color: '#3B82F6',
    bg: '#1A2744',
    tooltip: 'El bot está activamente recorriendo su web y generando insights. Revisamos cada formulario, botón, canal de contacto y embudo de conversión.',
  },
  finished: {
    label: 'Audit Finished',
    color: '#10B981',
    bg: '#1A3A2E',
    tooltip: 'El análisis está completo. Hemos generado el reporte ejecutivo con todas las métricas, insights y recomendaciones. Listo para contactar al negocio.',
  },
  waiting: {
    label: 'Waiting Response',
    color: '#F59E0B',
    bg: '#3A2E1A',
    tooltip: 'Reporte enviado al negocio vía cold email. Esperando su respuesta para agendar una demo o discutir el upgrade a suscripción mensual.',
  },
  enrolled: {
    label: 'Enrolled',
    color: '#5B3DF5',
    bg: '#1A1533',
    tooltip: 'Cliente pagando suscripción mensual de Ghost Shopper. Recibe reportes continuos de auditoría y benchmarking competitivo.',
  },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status]
  if (!config) return null

  return (
    <Tooltip content={config.tooltip} position="right">
      <span
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-semibold cursor-help transition-transform hover:scale-[1.02]"
        style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}30` }}
      >
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: config.color }} />
        {config.label}
      </span>
    </Tooltip>
  )
}
