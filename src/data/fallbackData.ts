// Centralized fallback data for when Supabase is unavailable
import { PortfolioCompany } from "@/types/portfolio";

// ==========================================
// ABOUT CONTENT FALLBACK
// ==========================================
export interface AboutContent {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  value: string | null;
  label: string | null;
  icon: string | null;
  display_order: number;
}

export const fallbackAboutContent: AboutContent[] = [
  // Hero
  {
    id: 'fallback-hero',
    section: 'hero',
    title: 'Construyendo el futuro empresarial de la Península Ibérica',
    subtitle: 'Somos una gestora de capital privado especializada en adquisiciones de empresas medianas con potencial de transformación y crecimiento internacional.',
    content: null,
    value: null,
    label: null,
    icon: null,
    display_order: 1,
  },
  // KPIs - Realistic PE fund metrics
  {
    id: 'fallback-kpi-1',
    section: 'kpi',
    title: null,
    subtitle: null,
    content: null,
    value: '€150M+',
    label: 'Capital Gestionado',
    icon: 'Wallet',
    display_order: 10,
  },
  {
    id: 'fallback-kpi-2',
    section: 'kpi',
    title: null,
    subtitle: null,
    content: null,
    value: '8',
    label: 'Empresas en Portfolio',
    icon: 'Briefcase',
    display_order: 11,
  },
  {
    id: 'fallback-kpi-3',
    section: 'kpi',
    title: null,
    subtitle: null,
    content: null,
    value: '15+',
    label: 'Años de Experiencia',
    icon: 'Clock',
    display_order: 12,
  },
  {
    id: 'fallback-kpi-4',
    section: 'kpi',
    title: null,
    subtitle: null,
    content: null,
    value: '2,4x',
    label: 'Múltiplo Medio (MOIC)',
    icon: 'Target',
    display_order: 13,
  },
  // Strategies - PE investment approaches
  {
    id: 'fallback-strategy-1',
    section: 'strategy',
    title: 'Buy & Build',
    subtitle: 'Consolidación sectorial mediante adquisiciones estratégicas',
    content: 'Identificamos plataformas de calidad en sectores fragmentados y ejecutamos estrategias de add-on para crear líderes regionales con escala y eficiencia operativa.',
    value: null,
    label: null,
    icon: 'GitMerge',
    display_order: 20,
  },
  {
    id: 'fallback-strategy-2',
    section: 'strategy',
    title: 'Growth Equity',
    subtitle: 'Capital para acelerar el crecimiento orgánico',
    content: 'Aportamos recursos, experiencia y red de contactos para escalar operaciones, expandir mercados geográficos y desarrollar nuevas líneas de negocio.',
    value: null,
    label: null,
    icon: 'TrendingUp',
    display_order: 21,
  },
  {
    id: 'fallback-strategy-3',
    section: 'strategy',
    title: 'Partnership',
    subtitle: 'Alianza estratégica con equipos directivos',
    content: 'Colaboramos estrechamente con fundadores y directivos, respetando su visión mientras aportamos gobernanza, profesionalización y acceso a capital.',
    value: null,
    label: null,
    icon: 'Users',
    display_order: 22,
  },
  // Value Creation - Investment track record
  {
    id: 'fallback-value-1',
    section: 'value_creation',
    title: null,
    subtitle: null,
    content: 'Crecimiento medio de ingresos durante el periodo de inversión',
    value: '>85%',
    label: 'Crecimiento Ingresos',
    icon: null,
    display_order: 30,
  },
  {
    id: 'fallback-value-2',
    section: 'value_creation',
    title: null,
    subtitle: null,
    content: 'Mejora media del margen EBITDA en participadas',
    value: '+5pp',
    label: 'Mejora EBITDA',
    icon: null,
    display_order: 31,
  },
  {
    id: 'fallback-value-3',
    section: 'value_creation',
    title: null,
    subtitle: null,
    content: 'Empleos netos creados en empresas del portfolio',
    value: '850+',
    label: 'Empleos Creados',
    icon: null,
    display_order: 32,
  },
  {
    id: 'fallback-value-4',
    section: 'value_creation',
    title: null,
    subtitle: null,
    content: 'Internacionalización: nuevos mercados abiertos',
    value: '+35%',
    label: 'Expansión Internacional',
    icon: null,
    display_order: 33,
  },
  // ESG
  {
    id: 'fallback-esg',
    section: 'esg',
    title: 'Inversión Responsable',
    subtitle: 'Integramos criterios ESG en todas nuestras decisiones de inversión',
    content: 'Creemos que la sostenibilidad y la rentabilidad van de la mano. Trabajamos con nuestras participadas para implementar prácticas responsables que generen valor a largo plazo para todos los stakeholders.',
    value: null,
    label: null,
    icon: 'Leaf',
    display_order: 40,
  },
];

// ==========================================
// PORTFOLIO COMPANIES FALLBACK
// Mirrors actual database structure and real companies
// ==========================================
export const fallbackPortfolioCompanies: PortfolioCompany[] = [
  {
    id: 'fallback-company-1',
    name: 'ConsulPro Advisory',
    slug: 'consulpro-advisory',
    description: 'Consultoría estratégica especializada en transformación digital y optimización operativa para empresas del mid-market.',
    logo_url: null,
    website_url: 'https://consulpro.example.com',
    sector: 'Servicios',
    stage: 'Growth',
    country: 'Spain',
    founded_year: 2015,
    investment_date: '2023-06-15',
    investment_thesis: 'Consolidación del sector de consultoría para PYMEs con modelo escalable y recurrencia de ingresos.',
    metrics: {
      revenue: '€8M',
      employees: '65',
      valuation: '€30M',
    },
    timeline: [
      { date: '2024', event: 'Expansión a Portugal' },
      { date: '2023', event: 'Inversión estratégica' },
      { date: '2022', event: 'Digitalización servicios' },
    ],
    is_active: true,
    is_featured: true,
    display_order: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-company-2',
    name: 'Grupo Mediterráneo Foods',
    slug: 'grupo-mediterraneo-foods',
    description: 'Holding de marcas premium de alimentación saludable: aceites, conservas y productos ecológicos de origen español.',
    logo_url: null,
    website_url: 'https://mediterraneo-foods.example.com',
    sector: 'Food & Consumer',
    stage: 'Buy-and-build',
    country: 'Spain',
    founded_year: 2010,
    investment_date: '2021-06-20',
    investment_thesis: 'Consolidación del mercado de alimentación premium y ecológica mediante buy-and-build, con enfoque en exportación a mercados europeos.',
    metrics: {
      revenue: '€95M',
      employees: '450',
      valuation: '€180M',
    },
    timeline: [
      { date: '2024', event: 'Adquisición marca ecológica' },
      { date: '2023', event: 'Entrada en Alemania' },
      { date: '2021', event: 'Plataforma inicial' },
    ],
    is_active: true,
    is_featured: true,
    display_order: 2,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-company-3',
    name: 'LogiTrans Iberia',
    slug: 'logitrans-iberia',
    description: 'Operador logístico especializado en última milla y transporte refrigerado para e-commerce y retail alimentario.',
    logo_url: null,
    website_url: 'https://logitrans-iberia.example.com',
    sector: 'Industriales y Distribución',
    stage: 'Growth',
    country: 'Spain',
    founded_year: 2015,
    investment_date: '2023-04-15',
    investment_thesis: 'Consolidación del sector de última milla aprovechando el crecimiento del e-commerce y la demanda de logística especializada en alimentación.',
    metrics: {
      revenue: '€45M',
      employees: '320+',
      valuation: '€80M',
    },
    timeline: [
      { date: '2024', event: 'Apertura hub Portugal' },
      { date: '2023', event: 'Inversión estratégica' },
      { date: '2022', event: 'Flota 100% eléctrica' },
    ],
    is_active: true,
    is_featured: true,
    display_order: 3,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-company-4',
    name: 'TechServices Pro',
    slug: 'techservices-pro',
    description: 'Outsourcing de servicios IT y soporte técnico para empresas medianas con modelo de suscripción.',
    logo_url: null,
    website_url: 'https://techservices-pro.example.com',
    sector: 'Servicios',
    stage: 'Series A',
    country: 'Spain',
    founded_year: 2018,
    investment_date: '2022-09-01',
    investment_thesis: 'Captura de demanda de externalización IT en el mid-market con modelo SLA y alta retención.',
    metrics: {
      revenue: '€12M ARR',
      employees: '85',
      valuation: '€45M',
    },
    timeline: [
      { date: '2024', event: 'Lanzamiento SOC' },
      { date: '2023', event: 'Certificación ISO 27001' },
      { date: '2022', event: 'Serie A - €8M' },
    ],
    is_active: true,
    is_featured: true,
    display_order: 4,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-company-5',
    name: 'Iberian Beverages',
    slug: 'iberian-beverages',
    description: 'Productor y distribuidor de bebidas premium y craft con fuerte presencia en hostelería.',
    logo_url: null,
    website_url: 'https://iberian-beverages.example.com',
    sector: 'Food & Consumer',
    stage: 'Series B',
    country: 'Spain',
    founded_year: 2016,
    investment_date: '2023-01-10',
    investment_thesis: 'Crecimiento del segmento craft y premium en bebidas con potencial de consolidación de marcas locales.',
    metrics: {
      revenue: '€25M',
      employees: '120',
      valuation: '€60M',
    },
    timeline: [
      { date: '2024', event: 'Adquisición cervecera artesanal' },
      { date: '2023', event: 'Serie B - €12M' },
      { date: '2022', event: 'Expansión canal horeca' },
    ],
    is_active: true,
    is_featured: true,
    display_order: 5,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'fallback-company-6',
    name: 'Mantec Industrial',
    slug: 'mantec-industrial',
    description: 'Empresa de mantenimiento industrial predictivo con IoT y análisis de datos para plantas de producción.',
    logo_url: null,
    website_url: 'https://mantec-industrial.example.com',
    sector: 'Industriales y Distribución',
    stage: 'Series A',
    country: 'Portugal',
    founded_year: 2019,
    investment_date: '2024-02-01',
    investment_thesis: 'Transformación digital del mantenimiento industrial mediante sensores IoT y analytics predictivo.',
    metrics: {
      revenue: '€6M',
      employees: '48',
      valuation: '€20M',
    },
    timeline: [
      { date: '2024', event: 'Serie A - €5M' },
      { date: '2023', event: 'Contrato parques eólicos' },
      { date: '2022', event: 'Plataforma IoT v2' },
    ],
    is_active: true,
    is_featured: false,
    display_order: 6,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
];

// Filter options fallback - derived from actual portfolio
export const fallbackFilterOptions = {
  sectors: ['Servicios', 'Food & Consumer', 'Industriales y Distribución'],
  stages: ['Seed', 'Series A', 'Series B', 'Growth', 'Buy-and-build'],
  countries: ['Spain', 'Portugal'],
};

// ==========================================
// TEAM MEMBERS FALLBACK
// Realistic PE fund team structure
// ==========================================
export interface TeamMember {
  id: string;
  name: string;
  position: string;
  email: string | null;
  linkedin_url: string | null;
  image_url: string | null;
  bio: string | null;
  section: string | null;
  display_order: number;
}

export const fallbackTeamMembers: TeamMember[] = [
  {
    id: 'fallback-team-1',
    name: 'Lluís Montanya',
    position: 'M&A',
    email: null,
    linkedin_url: null,
    image_url: 'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718155505_qft99m.png',
    bio: 'Especialista en fusiones y adquisiciones con amplia experiencia en el mercado ibérico.',
    section: 'Equipo Principal',
    display_order: 1,
  },
  {
    id: 'fallback-team-2',
    name: 'Samuel L. Navarro',
    position: 'M&A - TAX Partner',
    email: null,
    linkedin_url: null,
    image_url: 'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718254153_74hs9r.png',
    bio: 'Experto en fiscalidad de operaciones M&A y estructuración de transacciones.',
    section: 'Equipo Principal',
    display_order: 2,
  },
  {
    id: 'fallback-team-3',
    name: 'Aleix Miró',
    position: 'Abogado y Asesor Financiero',
    email: null,
    linkedin_url: null,
    image_url: 'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756993237527_02lfn5.png',
    bio: 'Asesoramiento legal y financiero integral en operaciones de M&A.',
    section: 'Equipo Principal',
    display_order: 3,
  },
  {
    id: 'fallback-team-4',
    name: 'Marc Ticó',
    position: 'Asociado M&A',
    email: null,
    linkedin_url: null,
    image_url: 'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718199385_byugjd.png',
    bio: 'Análisis y ejecución de operaciones de fusiones y adquisiciones.',
    section: 'Equipo Principal',
    display_order: 4,
  },
  {
    id: 'fallback-team-5',
    name: 'Oriol Iglesias',
    position: 'Analista M&A',
    email: null,
    linkedin_url: null,
    image_url: 'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756830595076_0wjbju.png',
    bio: 'Análisis financiero y due diligence en operaciones corporativas.',
    section: 'Equipo Principal',
    display_order: 6,
  },
  {
    id: 'fallback-team-6',
    name: 'Marc Canet',
    position: 'Analista M&A',
    email: null,
    linkedin_url: null,
    image_url: 'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718180561_qxbyng.png',
    bio: 'Modelización financiera y valoración de empresas.',
    section: 'Equipo Principal',
    display_order: 7,
  },
  {
    id: 'fallback-team-7',
    name: 'Albert Ticó',
    position: 'Analista M&A',
    email: null,
    linkedin_url: null,
    image_url: 'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1756718339088_7pjhcq.png',
    bio: 'Soporte analítico en procesos de inversión y desinversión.',
    section: 'Equipo Principal',
    display_order: 9,
  },
  {
    id: 'fallback-team-8',
    name: 'Marcel Padrós',
    position: 'Analista M&A',
    email: null,
    linkedin_url: null,
    image_url: 'https://fwhqtzkkvnjkazhaficj.supabase.co/storage/v1/object/public/case-studies-images/team/1767785143414_d0nd5.png',
    bio: 'Análisis de mercado y preparación de documentación de inversión.',
    section: 'Equipo Principal',
    display_order: 10,
  },
];

// ==========================================
// HOME CONTENT FALLBACK
// For homepage sections
// ==========================================
export interface HomeContent {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  cta_text: string | null;
  cta_url: string | null;
  display_order: number;
}

export const fallbackHomeContent: HomeContent[] = [
  {
    id: 'fallback-home-hero',
    section: 'hero',
    title: 'Invertimos en el crecimiento de empresas excepcionales',
    subtitle: 'Capittal | Invest es una gestora de capital privado que se asocia con emprendedores y equipos directivos para construir los líderes empresariales del mañana.',
    content: null,
    cta_text: 'Conocer Portfolio',
    cta_url: '/portfolio',
    display_order: 1,
  },
  {
    id: 'fallback-home-mission',
    section: 'mission',
    title: 'Nuestra Misión',
    subtitle: 'Creamos valor sostenible a través de la colaboración estratégica',
    content: 'Nos asociamos con empresas medianas de la Península Ibérica que tienen potencial de transformación. Aportamos capital, experiencia operativa y una red de contactos para acelerar su crecimiento.',
    cta_text: 'Sobre Nosotros',
    cta_url: '/about',
    display_order: 2,
  },
];

// ==========================================
// NEWS/INSIGHTS FALLBACK
// For news section when database is unavailable
// ==========================================
export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  published_at: string;
  image_url: string | null;
  is_featured: boolean;
}

export const fallbackNewsArticles: NewsArticle[] = [
  {
    id: 'fallback-news-1',
    title: 'Capittal | Invest cierra su tercer fondo con €150M',
    slug: 'capittal-cierra-tercer-fondo',
    excerpt: 'El nuevo vehículo de inversión permitirá continuar la estrategia de buy-and-build en sectores clave de la economía ibérica.',
    content: null,
    category: 'Noticias',
    published_at: '2026-01-15T10:00:00.000Z',
    image_url: null,
    is_featured: true,
  },
  {
    id: 'fallback-news-2',
    title: 'LogiTrans Iberia abre nuevo hub logístico en Lisboa',
    slug: 'logitrans-hub-lisboa',
    excerpt: 'La expansión a Portugal refuerza la posición de liderazgo en última milla para e-commerce alimentario.',
    content: null,
    category: 'Portfolio',
    published_at: '2026-01-08T10:00:00.000Z',
    image_url: null,
    is_featured: false,
  },
  {
    id: 'fallback-news-3',
    title: 'Tendencias M&A 2024: El mid-market español',
    slug: 'tendencias-ma-2024',
    excerpt: 'Análisis del mercado de fusiones y adquisiciones en el segmento de empresas medianas.',
    content: null,
    category: 'Insights',
    published_at: '2026-01-01T10:00:00.000Z',
    image_url: null,
    is_featured: false,
  },
];
