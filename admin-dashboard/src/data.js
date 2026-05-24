/* Ghost Shopper — Admin Dashboard Data */

export const businesses = [
  {
    id: 'ramirez-vazquez-001',
    name: 'Ramírez Vázquez Bienes Raíces',
    slug: 'ramirezvazquez',
    website: 'ramirezvazquez.paoloose.site',
    fullUrl: 'https://ramirezvazquez.paoloose.site',
    location: {
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      coords: { lat: 19.4326, lng: -99.1332 },
    },
    industry: 'Inmobiliaria Residencial',
    founded: '2019',
    employees: '4-10',
    status: 'finished',
    score: 6.2,
    context: `Ramírez Vázquez Bienes Raíces es una agencia inmobiliaria con sede en Ciudad de México, México. Fundada en 2019, opera con un equipo de 4-10 personas. Su propuesta de valor se centra en brindar seguridad y certeza jurídica tanto a vendedores como compradores.

Páginas encontradas: 14 | Imágenes: 48 | Formularios: 2
Canales: WhatsApp ✓, Email ✓, Teléfono ✓, Chatbot ✗, Login ✓, Blog ✗
Propiedades listadas: 12

Performance: Mobile 42/100, Desktop 71/100, FCP 2.8s, LCP 4.1s, CLS 0.12
SEO: Sin schema markup, sin Open Graph, sin Twitter Cards
Trust: Sin testimonios, sin certificaciones, sin reviews públicas
UX: Sin precios visibles, sin tour virtual, CTA sí presente

Keywords: bienes raíces, departamentos, cdmx, inmobiliaria
Redes: Facebook, Instagram, YouTube, X/Twitter`,
    lastAuditAt: '2025-05-24T22:00:00Z',
    crawlData: {
      pagesFound: 14,
      totalImages: 48,
      formsDetected: 2,
      hasWhatsApp: true,
      hasEmail: true,
      hasPhone: true,
      hasChatbot: false,
      hasLogin: true,
      hasBlog: false,
      socialMedia: {
        facebook: 'https://www.facebook.com/profile.php?id=61557971802285',
        instagram: 'https://www.instagram.com/ramirezvazquezmx/',
        youtube: 'https://www.youtube.com/@bienesraicesramirezvazquez',
        x: 'https://x.com/RVazquez_BR',
      },
      seo: {
        title: 'Ramirez Vazquez Bienes Raices | vender mi propiedad en ciudad de mexico',
        description: 'Somos una agencia inmobiliaria enfocada en brindar seguridad y certeza jurídica...',
        hasSchema: false,
        hasOpenGraph: false,
        hasTwitterCard: false,
        keywords: ['bienes raíces', 'departamentos', 'cdmx', 'inmobiliaria'],
      },
      performance: {
        mobileSpeed: 42,
        desktopSpeed: 71,
        firstContentfulPaint: '2.8s',
        largestContentfulPaint: '4.1s',
        cls: 0.12,
      },
      ux: {
        hasPricingVisible: false,
        hasTestimonials: false,
        hasVirtualTour: false,
        hasAgentPhotos: true,
        hasCTAAboveFold: true,
        navigationItems: 7,
        propertyCount: 12,
      },
      trustSignals: {
        hasReviews: false,
        hasCertificates: false,
        hasYearsBadge: true,
        hasTeamSection: true,
        hasPrivacyPolicy: true,
      },
      contentAnalysis: {
        wordCount: 1847,
        languages: ['es'],
        hasSpellingErrors: 0,
        readabilityScore: 68,
        hasDuplicateContent: false,
        imagesWithoutAlt: 3,
      },
    },
    metrics: {
      responseRate: 0,
      avgResponseTime: null,
      leadsPerMonth: 0,
      conversionRate: 0,
      competitors: [
        { name: 'Inmobiliaria Torres', responseTime: '2.3 min', hasPricing: true },
        { name: 'Grupo Casanova', responseTime: '8.1 min', hasPricing: true },
        { name: 'Home CDMX', responseTime: '1.5 min', hasPricing: true },
      ],
    },
  },
  {
    id: 'torres-inmo-002',
    name: 'Inmobiliaria Torres',
    slug: 'torresinmo',
    website: 'torresinmo.mx',
    fullUrl: 'https://torresinmo.mx',
    location: { city: 'Guadalajara', state: 'Jalisco', country: 'México' },
    industry: 'Inmobiliaria Residencial',
    founded: '2015',
    employees: '11-25',
    status: 'waiting',
    score: 7.8,
    lastAuditAt: '2025-05-20T14:30:00Z',
    context: `Inmobiliaria Torres es una agencia de bienes raíces con sede en Guadalajara, Jalisco. Fundada en 2015, cuenta con un equipo de 11-25 personas. Es una inmobiliaria establecida con buena presencia digital.

Páginas encontradas: 28 | Imágenes: 112 | Formularios: 4
Canales: WhatsApp ✓, Email ✓, Teléfono ✓, Chatbot ✓, Login ✗, Blog ✓
Propiedades listadas: 34

Performance: Mobile 78/100, Desktop 91/100
SEO: Schema markup presente, Open Graph presente
Trust: Testimonios presentes, certificaciones presentes, reviews presentes
UX: Precios visibles ✓, tour virtual ✓, CTA presente`,
    crawlData: {
      pagesFound: 28, totalImages: 112, formsDetected: 4,
      hasWhatsApp: true, hasEmail: true, hasPhone: true,
      hasChatbot: true, hasLogin: false, hasBlog: true,
      socialMedia: { facebook: '...', instagram: '...' },
      seo: { title: 'Inmobiliaria Torres | Casas y Departamentos', hasSchema: true, hasOpenGraph: true, keywords: ['casas', 'departamentos', 'guadalajara'] },
      performance: { mobileSpeed: 78, desktopSpeed: 91 },
      ux: { hasPricingVisible: true, hasTestimonials: true, hasVirtualTour: true, propertyCount: 34 },
      trustSignals: { hasReviews: true, hasCertificates: true, hasYearsBadge: true, hasTeamSection: true, hasPrivacyPolicy: true },
      contentAnalysis: { wordCount: 3200, readabilityScore: 72 },
    },
    metrics: { competitors: [] },
  },
  {
    id: 'casanova-003',
    name: 'Grupo Casanova',
    slug: 'grupocasanova',
    website: 'grupocasanova.com',
    fullUrl: 'https://grupocasanova.com',
    location: { city: 'Monterrey', state: 'Nuevo León', country: 'México' },
    industry: 'Inmobiliaria Comercial',
    founded: '2012',
    employees: '25-50',
    status: 'enrolled',
    score: 8.4,
    lastAuditAt: '2025-05-18T09:15:00Z',
    crawlData: {
      pagesFound: 52, totalImages: 210, formsDetected: 6,
      hasWhatsApp: true, hasEmail: true, hasPhone: true,
      hasChatbot: true, hasLogin: true, hasBlog: true,
      socialMedia: { facebook: '...', instagram: '...', linkedin: '...' },
      seo: { title: 'Grupo Casanova | Bienes Raíces Monterrey', hasSchema: true, hasOpenGraph: true, keywords: ['oficinas', 'locales', 'monterrey'] },
      performance: { mobileSpeed: 85, desktopSpeed: 94 },
      ux: { hasPricingVisible: true, hasTestimonials: true, hasVirtualTour: true, propertyCount: 67 },
      trustSignals: { hasReviews: true, hasCertificates: true, hasYearsBadge: true, hasTeamSection: true, hasPrivacyPolicy: true },
      contentAnalysis: { wordCount: 5600, readabilityScore: 75 },
    },
    metrics: { competitors: [] },
  },
  {
    id: 'home-cdmx-004',
    name: 'Home CDMX',
    slug: 'homecdmx',
    website: 'homecdmx.com',
    fullUrl: 'https://homecdmx.com',
    location: { city: 'Ciudad de México', state: 'CDMX', country: 'México' },
    industry: 'Inmobiliaria de Lujo',
    founded: '2021',
    employees: '2-5',
    status: 'auditing',
    score: null,
    lastAuditAt: null,
    crawlData: {
      pagesFound: 8, totalImages: 24, formsDetected: 1,
      hasWhatsApp: true, hasEmail: true, hasPhone: false,
      hasChatbot: false, hasLogin: false, hasBlog: false,
      socialMedia: { instagram: '...' },
      seo: { title: 'Home CDMX | Departamentos de Lujo', hasSchema: false, hasOpenGraph: false, keywords: ['lujo', 'polanco', 'departamentos'] },
      performance: { mobileSpeed: 35, desktopSpeed: 58 },
      ux: { hasPricingVisible: false, hasTestimonials: false, hasVirtualTour: false, propertyCount: 6 },
      trustSignals: { hasReviews: false, hasCertificates: false, hasYearsBadge: false, hasTeamSection: false, hasPrivacyPolicy: false },
      contentAnalysis: { wordCount: 890, readabilityScore: 55 },
    },
    metrics: { competitors: [] },
  },
]

export const contacts = [
  {
    id: 'contact-001',
    businessId: 'ramirez-vazquez-001',
    name: 'Jorge Ramírez',
    email: 'contacto@ramirezvazquez.com',
    responseTime: 2.5,
    personalization: 6.5,
    clarity: 7.2,
    cta: 5.8,
    score: 6.2,
    emails: [
      {
        direction: 'sent',
        subject: 'Reporte gratuito de su presencia digital — Ghost Shopper',
        body: `Estimado equipo de Ramírez Vázquez Bienes Raíces,\n\nMi nombre es Sofía Méndez y soy consultora de estrategia digital en Ghost Shopper.\n\nDurante las últimas semanas, nuestro sistema ha rastreado y analizado la experiencia digital de su agencia. Hemos identificado oportunidades significativas para mejorar la captación de leads.\n\nNos gustaría compartir con ustedes un reporte ejecutivo completamente gratuito que incluye:\n\n• Análisis de velocidad y performance móvil\n• Evaluación del embudo de conversión\n• Auditoría de UX/UI orientada a ventas\n• Benchmarking contra 3 competidores directos\n• Recomendaciones accionables priorizadas\n\n¿Les gustaría recibirlo? Solo responden a este correo y lo enviamos en las próximas 24 horas.\n\nSaludos cordiales,\nSofía Méndez\nGhost Shopper — Dream Team`,
        date: '15 May',
        status: 'responded',
        aiScore: 7.5,
      },
      {
        direction: 'received',
        subject: 'Re: Reporte gratuito de su presencia digital',
        body: `Hola Sofía,\n\nMuchas gracias por contactarnos. Estoy muy interesado en recibir el reporte ejecutivo de nuestra agencia. Hace tiempo que sospechamos que nuestra web no está rindiendo como debería.\n\nAdemás, me gustaría conocer más sobre el servicio de suscripción mensual. Estamos abiertos a mejorar nuestros procesos.\n\nUn saludo,\nJorge Ramírez\nDirector — Ramírez Vázquez Bienes Raíces`,
        date: '16 May',
        status: 'responded',
        aiScore: 6.8,
      },
    ],
  },
  {
    id: 'contact-002',
    businessId: 'torres-inmo-002',
    name: 'María Torres',
    email: 'contacto@torresinmo.mx',
    responseTime: 1.8,
    personalization: 8.2,
    clarity: 8.5,
    cta: 7.9,
    score: 7.8,
    emails: [
      {
        direction: 'sent',
        subject: 'Su web está perdiendo el 40% de leads móviles — Análisis gratuito',
        body: `Estimado equipo de Inmobiliaria Torres,\n\nMi nombre es Sofía Méndez, consultora de Ghost Shopper. Hemos analizado su web y detectamos que pierde el 40% de leads en móvil.\n\n¿Le gustaría recibir nuestro análisis gratuito?`,
        date: '18 May',
        status: 'waiting',
        aiScore: 8.0,
      },
    ],
  },
  {
    id: 'contact-003',
    businessId: 'casanova-003',
    name: 'María Elena Casanova',
    email: 'ventas@grupocasanova.com',
    responseTime: 3.2,
    personalization: 7.8,
    clarity: 8.0,
    cta: 6.5,
    score: 7.1,
    emails: [
      {
        direction: 'sent',
        subject: 'Felicitaciones — y una oportunidad de crecimiento',
        body: `Estimado equipo de Grupo Casanova,\n\nFelicitaciones por su excelente presencia digital. Su web está en el top 10% del sector inmobiliario en México. Sin embargo, detectamos oportunidades específicas...`,
        date: '10 May',
        status: 'responded',
        aiScore: 8.2,
      },
      {
        direction: 'received',
        subject: 'Re: Felicitaciones',
        body: `Hola Sofía,\n\nGracias por su análisis. Ya somos clientes de Ghost Shopper Premium. Estamos muy satisfechos con los reportes mensuales y el benchmarking competitivo.\n\nSaludos,\nMaría Elena Casanova\nCEO — Grupo Casanova`,
        date: '10 May',
        status: 'responded',
        aiScore: 8.5,
      },
    ],
  },
]

export const audits = [
  {
    id: 'audit-001',
    businessId: 'ramirez-vazquez-001',
    businessName: 'Ramírez Vázquez Bienes Raíces',
    createdAt: '2025-05-24T22:00:00Z',
    model: 'kimi-k2.6',
    status: 'completed',
    totalSteps: 12,
    score: 6.2,
    findings: [
      { category: 'Response Time', severity: 'bad', title: 'Tiempo de respuesta crítico', description: 'El sitio tarda 4.1s en cargar en móvil. El 72% de leads en CDMX navegan desde smartphones.', recommendation: 'Optimizar imágenes (AVIF/WebP), lazy-loading, y reducir JS bloqueante.' },
      { category: 'Conversion Funnel', severity: 'warn', title: 'Sin precios visibles', description: 'Ninguna propiedad muestra precio. En estudios de usabilidad inmobiliaria, esto genera abandono temprano del 40%.', recommendation: 'Mostrar rango de precios o "desde $X" en cada tarjeta de propiedad.' },
      { category: 'Trust', severity: 'bad', title: 'Ausencia de testimonios', description: 'Sin reviews, testimonios ni badges de certificación. La compra de inmueble requiere alto nivel de confianza.', recommendation: 'Agregar sección de testimonios de clientes y certificaciones de AMPI.' },
      { category: 'SEO', severity: 'warn', title: 'Schema markup ausente', description: 'Sin structured data (RealEstateListing, Organization, LocalBusiness). Google no enriquece los snippets.', recommendation: 'Implementar schema.org/RealEstateListing y LocalBusiness JSON-LD.' },
      { category: 'Mobile UX', severity: 'bad', title: 'Formularios rotos en móvil', description: 'El formulario de contacto no tiene autocomplete y el botón de WhatsApp es pequeño en pantallas <360px.', recommendation: 'Aumentar hit areas a 44px mínimo y agregar autocomplete a todos los inputs.' },
    ],
  },
  {
    id: 'audit-002',
    businessId: 'ramirez-vazquez-001',
    businessName: 'Ramírez Vázquez Bienes Raíces',
    createdAt: '2025-04-12T16:45:00Z',
    model: 'deepseek-v4-pro',
    status: 'completed',
    totalSteps: 18,
    score: 5.8,
    findings: [
      { category: 'Mobile UX', severity: 'bad', title: 'Imágenes sin alt text', description: '3 imágenes de propiedades carecen de texto alternativo. Impacta SEO y accesibilidad.', recommendation: 'Agregar alt descriptivo a todas las imágenes de propiedades.' },
      { category: 'SEO', severity: 'warn', title: 'Meta description duplicada', description: 'Todas las páginas de propiedades comparten la misma meta description.', recommendation: 'Generar meta descriptions únicas por propiedad con precio y ubicación.' },
      { category: 'Trust', severity: 'warn', title: 'Sin política de privacidad visible', description: 'Aunque existe la página, el link en el footer es de bajo contraste.', recommendation: 'Hacer el link de privacidad más visible y agregar checkbox de consentimiento en el formulario.' },
    ],
  },
  {
    id: 'audit-003',
    businessId: 'ramirez-vazquez-001',
    businessName: 'Ramírez Vázquez Bienes Raíces',
    createdAt: '2025-03-08T11:20:00Z',
    model: 'glm-5.1',
    status: 'completed',
    totalSteps: 9,
    score: 5.2,
    findings: [
      { category: 'Performance', severity: 'bad', title: 'LCP excedido', description: 'Largest Contentful Paint de 5.2s supera el umbral recomendado de 2.5s.', recommendation: 'Preload hero images y usar font-display: swap.' },
      { category: 'Content', severity: 'warn', title: 'Contenido escaso', description: 'Promedio de 154 palabras por página de propiedad. Ideal: 300+.', recommendation: 'Expandir descripciones con amenities, vecindario y transporte cercano.' },
    ],
  },
]
