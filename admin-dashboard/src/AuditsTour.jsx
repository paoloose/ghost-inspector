import { useJoyride, STATUS } from 'react-joyride'
import { useState, useEffect } from 'react'

const AUDITS_TOUR_STEPS = [
  {
    target: 'body',
    placement: 'center',
    title: '👻 Auditorías con IA',
    content: 'Aquí lanzas agentes fantasmas que navegan sitios web en tiempo real, evalúan canales de contacto y extraen números de teléfono y WhatsApp.',
    disableBeacon: true,
  },
  {
    target: '#step-indicator',
    placement: 'bottom',
    title: 'Asistente de 3 pasos',
    content: 'Elige el negocio → Configura el agente → Lanza la auditoría.',
    spotlightPadding: 8,
  },
  {
    target: '#business-grid',
    placement: 'bottom',
    title: '🏢 Selecciona un negocio',
    content: 'Haz clic en la inmobiliaria que quieres auditar. Pulsa Continuar para avanzar.',
    spotlightPadding: 4,
  },
  {
    target: '#task-type-grid',
    placement: 'top',
    title: '🎯 Tipo de auditoría',
    content: 'WhatsApp extrae el número, Forms llena y envía formularios, Call extrae teléfonos, Everything audita todo.',
    spotlightPadding: 6,
    before: async () => {
      // Wait for any layout shifts
      await new Promise(r => setTimeout(r, 200))
    },
  },
  {
    target: '#edit-prompt-btn',
    placement: 'top',
    title: '✏️ Ver el prompt',
    content: 'Haz clic para ver las instrucciones exactas que recibe el agente. Es solo visual.',
    spotlightPadding: 4,
  },
  {
    target: '#launch-btn',
    placement: 'top',
    title: '🚀 Lanzar agente',
    content: 'Una vez configurado, presiona para iniciar. Verás el stream en vivo y el log de eventos.',
    spotlightPadding: 6,
  },
  {
    target: 'body',
    placement: 'center',
    title: '✨ ¡Listo para auditar!',
    content: 'Selecciona un negocio y lanza tu primera auditoría fantasma.',
    disableBeacon: true,
    skipScroll: true,
  },
]

export default function AuditsTour() {
  const [run, setRun] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('ghostshopper-audits-tour-seen')
    if (!seen) {
      // Small delay so DOM is ready
      const t = setTimeout(() => setRun(true), 400)
      return () => clearTimeout(t)
    }
  }, [])

  const { Tour } = useJoyride({
    run,
    continuous: true,
    steps: AUDITS_TOUR_STEPS,
    scrollToFirstStep: true,
    showSkipButton: true,
    showProgress: true,
    disableAnimation: true,
    disableOverlayClose: true,
    locale: {
      next: 'Siguiente',
      back: 'Atrás',
      skip: 'Omitir',
      last: 'Finalizar',
      close: 'Cerrar',
    },
    styles: {
      options: {
        primaryColor: '#5B3DF5',
        backgroundColor: '#1A1D27',
        textColor: '#F0F1F5',
        arrowColor: '#1A1D27',
        overlayColor: 'rgba(0,0,0,0.75)',
        zIndex: 1000,
        loaderDelay: 0,
        scrollDuration: 0,
        targetWaitTimeout: 0,
      },
      spotlight: {
        border: '2px solid #5B3DF5',
        borderRadius: '8px',
        boxShadow: '0 0 0 4px rgba(91, 61, 245, 0.35), 0 0 24px rgba(91, 61, 245, 0.45)',
      },
      tooltip: {
        borderRadius: '14px',
        fontSize: '15px',
        lineHeight: '1.5',
      },
      tooltipTitle: {
        fontSize: '18px',
        fontWeight: '700',
      },
      buttonNext: {
        backgroundColor: '#5B3DF5',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        padding: '8px 16px',
      },
      buttonBack: {
        color: '#9CA3AF',
        fontSize: '14px',
      },
      buttonSkip: {
        color: '#6B7280',
        fontSize: '13px',
      },
    },
    onEvent: (data) => {
      const { status, type } = data
      if (type === 'tour:end' || status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        localStorage.setItem('ghostshopper-audits-tour-seen', 'true')
        setRun(false)
      }
    },
  })

  return Tour
}
