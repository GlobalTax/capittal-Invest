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
    name: 'NovaTech Solutions',
    slug: 'novatech-solutions',
    description: 'Plataforma B2B SaaS líder en automatización de procesos empresariales para el sector financiero y asegurador.',
    logo_url: null,
    website_url: 'https://novatech-solutions.example.com',
    sector: 'Technology',
    stage: 'Series A',
    country: 'Spain',
    founded_year: 2019,
    investment_date: '2023-06-15',
    investment_thesis: 'Digitalización de procesos core en banca y seguros con tecnología propietaria de automatización inteligente.',
    metrics: {
      revenue: '€4M ARR',
      employees: '45',
      valuation: '€25M',
    },
    timeline: [
      { date: '2024', event: 'Expansión a Portugal y México' },
      { date: '2023', event: 'Serie A - €6M' },
      { date: '2022', event: 'Primeros clientes IBEX 35' },
    ],
    is_active: true,
    is_featured: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-company-2',
    name: 'BioHealth Diagnostics',
    slug: 'biohealth-diagnostics',
    description: 'Compañía de diagnóstico molecular especializada en tests rápidos y precisos para enfermedades infecciosas.',
    logo_url: null,
    website_url: 'https://biohealth-diagnostics.example.com',
    sector: 'Healthcare',
    stage: 'Series B',
    country: 'Portugal',
    founded_year: 2017,
    investment_date: '2022-03-01',
    investment_thesis: 'Liderazgo en diagnóstico POC (point-of-care) en la Península Ibérica con potencial de expansión europea.',
    metrics: {
      revenue: '€12M',
      employees: '85',
      valuation: '€60M',
    },
    timeline: [
      { date: '2024', event: 'Certificación CE-IVD nuevos tests' },
      { date: '2023', event: 'Entrada en Francia' },
      { date: '2022', event: 'Serie B - €15M' },
    ],
    is_active: true,
    is_featured: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-company-3',
    name: 'LogiTrans Iberia',
    slug: 'logitrans-iberia',
    description: 'Operador logístico especializado en última milla y transporte refrigerado para e-commerce y retail alimentario.',
    logo_url: null,
    website_url: 'https://logitrans-iberia.example.com',
    sector: 'Logistics',
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-company-4',
    name: 'AulaDigital',
    slug: 'auladigital',
    description: 'Plataforma de formación online corporativa con IA adaptativa para empresas del IBEX 35 y multinacionales.',
    logo_url: null,
    website_url: 'https://auladigital.example.com',
    sector: 'Education',
    stage: 'Series B',
    country: 'Spain',
    founded_year: 2018,
    investment_date: '2022-09-01',
    investment_thesis: 'Digitalización de la formación corporativa con tecnología propietaria de aprendizaje adaptativo basado en IA.',
    metrics: {
      revenue: '€12M ARR',
      employees: '85',
      valuation: '€45M',
    },
    timeline: [
      { date: '2024', event: 'Expansión LATAM' },
      { date: '2023', event: 'Lanzamiento módulo IA' },
      { date: '2022', event: 'Serie B - €8M' },
    ],
    is_active: true,
    is_featured: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-company-5',
    name: 'Grupo Mediterráneo Foods',
    slug: 'grupo-mediterraneo-foods',
    description: 'Holding de marcas premium de alimentación saludable: aceites, conservas y productos ecológicos de origen español.',
    logo_url: null,
    website_url: 'https://mediterraneo-foods.example.com',
    sector: 'Consumer',
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
    is_featured: false,
    display_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-company-6',
    name: 'CloudBooks Pro',
    slug: 'cloudbooks-pro',
    description: 'Software de gestión contable y fiscal en la nube para PYMEs y asesorías, con integración bancaria y facturación electrónica.',
    logo_url: null,
    website_url: 'https://cloudbooks-pro.example.com',
    sector: 'Technology',
    stage: 'Growth',
    country: 'Spain',
    founded_year: 2017,
    investment_date: '2023-01-10',
    investment_thesis: 'Captura de cuota en el mercado de software de gestión para PYMEs, aprovechando la obligatoriedad de factura electrónica en España.',
    metrics: {
      revenue: '€8M ARR',
      employees: '65',
      valuation: '€35M',
    },
    timeline: [
      { date: '2024', event: 'Módulo factura electrónica' },
      { date: '2023', event: 'Inversión growth' },
      { date: '2022', event: 'Integración OpenBanking' },
    ],
    is_active: true,
    is_featured: true,
    display_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-company-7',
    name: 'GreenEnergy Storage',
    slug: 'greenenergy-storage',
    description: 'Desarrollo y fabricación de sistemas de almacenamiento energético para instalaciones solares residenciales e industriales.',
    logo_url: null,
    website_url: 'https://greenenergy-storage.example.com',
    sector: 'Energy',
    stage: 'Seed',
    country: 'Spain',
    founded_year: 2021,
    investment_date: '2024-01-15',
    investment_thesis: 'Capturar la demanda creciente de almacenamiento energético en el mercado ibérico de autoconsumo solar.',
    metrics: {
      revenue: '€2M',
      employees: '25',
      valuation: '€10M',
    },
    timeline: [
      { date: '2024', event: 'Ronda Seed - €3M' },
      { date: '2023', event: 'Primeras instalaciones industriales' },
      { date: '2022', event: 'Lanzamiento producto' },
    ],
    is_active: true,
    is_featured: false,
    display_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-company-8',
    name: 'Mantec Industrial',
    slug: 'mantec-industrial',
    description: 'Empresa de mantenimiento industrial predictivo con IoT y análisis de datos para plantas de producción y energía renovable.',
    logo_url: null,
    website_url: 'https://mantec-industrial.example.com',
    sector: 'Industrial Services',
    stage: 'Series A',
    country: 'Portugal',
    founded_year: 2019,
    investment_date: '2024-02-01',
    investment_thesis: 'Transformación digital del mantenimiento industrial mediante sensores IoT y analytics predictivo para reducir tiempos de parada.',
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
    display_order: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Filter options fallback - derived from actual portfolio
export const fallbackFilterOptions = {
  sectors: ['Technology', 'Healthcare', 'Logistics', 'Education', 'Consumer', 'Energy', 'Industrial Services'],
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
    name: 'Carlos Martínez Vega',
    position: 'Socio Fundador y CEO',
    email: null,
    linkedin_url: null,
    image_url: null,
    bio: 'Más de 20 años de experiencia en private equity y M&A. Anteriormente socio en Altamar Capital Partners y director en Morgan Stanley. MBA por INSEAD y Licenciado en ADE por ICADE.',
    section: 'Socios',
    display_order: 1,
  },
  {
    id: 'fallback-team-2',
    name: 'Elena Rodríguez Blanco',
    position: 'Socia - Directora de Inversiones',
    email: null,
    linkedin_url: null,
    image_url: null,
    bio: 'Especialista en operaciones mid-market con track record de más de 25 transacciones completadas. 15 años en Magnum Capital y McKinsey. MBA por Wharton y Ingeniería Industrial por UPM.',
    section: 'Socios',
    display_order: 2,
  },
  {
    id: 'fallback-team-3',
    name: 'Miguel Ángel Torres',
    position: 'Director de Operaciones',
    email: null,
    linkedin_url: null,
    image_url: null,
    bio: 'Experto en mejora operativa y creación de valor post-inversión. 12 años liderando transformaciones en empresas del portfolio. Ex-BCG y Director de Operaciones en Grupo Antolín.',
    section: 'Equipo de Inversión',
    display_order: 3,
  },
  {
    id: 'fallback-team-4',
    name: 'Ana García Fernández',
    position: 'Principal',
    email: null,
    linkedin_url: null,
    image_url: null,
    bio: 'Responsable de origination y ejecución de deals. 8 años de experiencia en M&A y private equity. Anteriormente en Bain Capital y Rothschild. MBA por London Business School.',
    section: 'Equipo de Inversión',
    display_order: 4,
  },
  {
    id: 'fallback-team-5',
    name: 'Pablo Ruiz Navarro',
    position: 'Associate',
    email: null,
    linkedin_url: null,
    image_url: null,
    bio: 'Análisis financiero, due diligence y modelización. 4 años de experiencia en investment banking en JP Morgan y Lazard. CFA Charterholder y ADE por ESADE.',
    section: 'Equipo de Inversión',
    display_order: 5,
  },
  {
    id: 'fallback-team-6',
    name: 'Lucía Sánchez Moreno',
    position: 'CFO',
    email: null,
    linkedin_url: null,
    image_url: null,
    bio: 'Responsable de finanzas, reporting a inversores y compliance. 18 años de experiencia en auditoría y finanzas corporativas. Ex-socia de KPMG y Directora Financiera en Abertis.',
    section: 'Equipo Corporativo',
    display_order: 6,
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
    published_at: new Date().toISOString(),
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
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
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
    published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: null,
    is_featured: false,
  },
];
