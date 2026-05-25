import { useJoyride, STATUS } from 'react-joyride'
import { useState, useEffect } from 'react'

const DETAIL_TOUR_STEPS = [
  {
    target: 'body',
    placement: 'center',
    title: '🏢 Detalle del negocio',
    content: 'Aquí ves todo lo que Ghost Shopper ha descubierto sobre esta inmobiliaria: performance, canales, trust signals y auditorías previas.',
    disableBeacon: true,
  },
  {
    target: '#biz-header',
    placement: 'bottom',
    title: 'Score y estado',
    content: 'El score digital general y el estado actual del negocio en la plataforma.',
    spotlightPadding: 8,
  },
  {
    target: '#biz-tabs',
    placement: 'bottom',
    title: 'Pestañas',
    content: 'Crawled Information: datos escrapeados del sitio. Ghost Audits: auditorías previas con hallazgos.',
    spotlightPadding: 4,
  },
  {
    target: '#stats-grid',
    placement: 'top',
    title: '📊 Estadísticas',
    content: 'Performance (Core Web Vitals), Canales y Features disponibles, y Trust Signals del sitio.',
    spotlightPadding: 6,
  },
  {
    target: '#audit-cta',
    placement: 'top',
    title: '👻 Lanza auditoría',
    content: 'Haz clic para ir directo a Audits con este negocio preseleccionado.',
    spotlightPadding: 6,
  },
  {
    target: 'body',
    placement: 'center',
    title: '✨ ¡Explora y audita!',
    content: 'Revisa los datos escrapeados y lanza una auditoría fantasma para evaluar canales de contacto.',
    disableBeacon: true,
    skipScroll: true,
  },
]

export default function RadarDetailTour({ businessId }) {
  const storageKey = `ghostshopper-detail-tour-${businessId}`
  const [run, setRun] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(storageKey)
    if (!seen) {
      const t = setTimeout(() => setRun(true), 500)
      return () => clearTimeout(t)
    }
  }, [businessId, storageKey])

  const { Tour } = useJoyride({
    run,
    continuous: true,
    steps: DETAIL_TOUR_STEPS,
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
        localStorage.setItem(storageKey, 'true')
        setRun(false)
      }
    },
  })

  return Tour
}
