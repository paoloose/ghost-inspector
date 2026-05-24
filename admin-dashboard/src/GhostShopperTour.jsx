import { useJoyride } from 'react-joyride'
import { useState } from 'react'

const TOUR_STEPS = [
  {
    target: 'body',
    placement: 'center',
    title: '👻 Bienvenido a Ghost Shopper',
    content: (
      <div className="space-y-3">
        <p><b>Ghost Shopper</b> es una plataforma de mystery shopping con IA para el sector inmobiliario.</p>
        <p>Los agentes fantasmas <b>interactúan con sitios web como si fueran clientes reales</b>: navegan, llenan formularios, extraen números de contacto y evalúan cada canal de captación.</p>
        <p>Cada auditoría descubre <b>oportunidades de revenue</b> y <b>deficiencias</b> que cuestan leads. Los hallazgos se acumulan por negocio para crear un historial completo.</p>
        <p className="text-brand-light font-semibold">Esta guía te mostrará las funciones principales.</p>
      </div>
    ),
    disableBeacon: true,
    skipScroll: true,
  },
  {
    target: '#sidebar',
    placement: 'right',
    title: 'Navegación',
    content: 'Cambia entre Radar (negocios), Audits (auditorías con IA) y Contacts (evaluación de emails).',
    spotlightPadding: 8,
  },
  {
    target: '#radar-page',
    placement: 'bottom',
    title: '📡 Radar',
    content: 'Aquí ves todos los negocios inmobiliarios monitoreados. El mapa muestra el alcance geográfico de Ghost Shopper.',
    spotlightPadding: 8,
  },
  {
    target: '#reach-map',
    placement: 'top',
    title: '🗺️ Mapa de Alcance',
    content: 'Visualiza la cobertura geográfica. Los círculos de color representan el score digital de cada agencia.',
    spotlightPadding: 8,
  },
  {
    target: '#business-table',
    placement: 'top',
    title: '🏢 Negocios',
    content: 'Lista de inmobiliarias escrapeadas. Haz clic en una fila para ver detalles o en "Auditar" para lanzar un agente.',
    spotlightPadding: 8,
  },
  {
    target: '#audits-page',
    placement: 'bottom',
    title: '👻 Auditorías',
    content: 'El asistente de 3 pasos te guía para lanzar un agente fantasma sobre cualquier sitio web.',
    spotlightPadding: 8,
  },
  {
    target: '#task-type-grid',
    placement: 'top',
    title: '🎯 Tipos de Auditoría',
    content: (
      <div className="space-y-1">
        <p><b>WhatsApp:</b> Extrae el número de WhatsApp del sitio</p>
        <p><b>Forms:</b> Llena y envía formularios con datos de prueba</p>
        <p><b>Call:</b> Extrae números telefónicos</p>
        <p><b>Everything:</b> Auditoría completa del sitio</p>
      </div>
    ),
    spotlightPadding: 6,
  },
  {
    target: '#edit-prompt-btn',
    placement: 'top',
    title: '✏️ Ver Prompt',
    content: 'Haz clic aquí para ver el prompt exacto que recibe el agente. Es solo visual — el backend controla el prompt real.',
    spotlightPadding: 4,
  },
  {
    target: '#launch-btn',
    placement: 'top',
    title: '🚀 Lanzar Auditoría',
    content: 'Una vez configurado, presiona para iniciar. El agente navegará el sitio en vivo y verás el stream en tiempo real.',
    spotlightPadding: 6,
  },
  {
    target: 'body',
    placement: 'center',
    title: '✨ ¡Listo!',
    content: 'Ya conoces Ghost Shopper. Selecciona un negocio en Radar y lanza tu primera auditoría fantasma.',
    disableBeacon: true,
    skipScroll: true,
  },
]

export default function GhostShopperTour() {
  const [run, setRun] = useState(() => {
    // Only show tour on first visit
    return !localStorage.getItem('ghostshopper-tour-seen')
  })

  const { Tour } = useJoyride({
    run,
    continuous: true,
    steps: TOUR_STEPS,
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
      if (type === 'tour:end' || status === 'finished' || status === 'skipped') {
        localStorage.setItem('ghostshopper-tour-seen', 'true')
        setRun(false)
      }
    },
  })

  return Tour
}
