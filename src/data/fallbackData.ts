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
    title: 'Creando valor a través de asociaciones estratégicas',
    subtitle: 'Somos una gestora de capital privado especializada en adquisiciones de empresas medianas con potencial de crecimiento significativo.',
    content: null,
    value: null,
    label: null,
    icon: null,
    display_order: 1,
  },
  // KPIs
  {
    id: 'fallback-kpi-1',
    section: 'kpi',
    title: null,
    subtitle: null,
    content: null,
    value: '12+',
    label: 'Años de Experiencia',
    icon: 'Clock',
    display_order: 10,
  },
  {
    id: 'fallback-kpi-2',
    section: 'kpi',
    title: null,
    subtitle: null,
    content: null,
    value: '150+',
    label: 'Operaciones Completadas',
    icon: 'Briefcase',
    display_order: 11,
  },
  {
    id: 'fallback-kpi-3',
    section: 'kpi',
    title: null,
    subtitle: null,
    content: null,
    value: '€500M+',
    label: 'Capital Gestionado',
    icon: 'Wallet',
    display_order: 12,
  },
  {
    id: 'fallback-kpi-4',
    section: 'kpi',
    title: null,
    subtitle: null,
    content: null,
    value: '25+',
    label: 'Empresas en Portfolio',
    icon: 'Target',
    display_order: 13,
  },
  // Strategies
  {
    id: 'fallback-strategy-1',
    section: 'strategy',
    title: 'Buy & Build',
    subtitle: 'Consolidación sectorial mediante adquisiciones estratégicas',
    content: 'Identificamos plataformas de calidad y ejecutamos estrategias de add-on para crear líderes de mercado.',
    value: null,
    label: null,
    icon: 'GitMerge',
    display_order: 20,
  },
  {
    id: 'fallback-strategy-2',
    section: 'strategy',
    title: 'Growth Equity',
    subtitle: 'Capital para acelerar el crecimiento',
    content: 'Aportamos recursos y experiencia para escalar operaciones y expandir mercados.',
    value: null,
    label: null,
    icon: 'TrendingUp',
    display_order: 21,
  },
  {
    id: 'fallback-strategy-3',
    section: 'strategy',
    title: 'Partnership',
    subtitle: 'Alianza con equipos directivos',
    content: 'Colaboramos estrechamente con fundadores y directivos para maximizar el potencial de cada empresa.',
    value: null,
    label: null,
    icon: 'Users',
    display_order: 22,
  },
  // Value Creation
  {
    id: 'fallback-value-1',
    section: 'value_creation',
    title: null,
    subtitle: null,
    content: 'Crecimiento medio de ingresos',
    value: '2,5x',
    label: 'Ingresos',
    icon: null,
    display_order: 30,
  },
  {
    id: 'fallback-value-2',
    section: 'value_creation',
    title: null,
    subtitle: null,
    content: 'Mejora media del EBITDA',
    value: '3x',
    label: 'EBITDA',
    icon: null,
    display_order: 31,
  },
  {
    id: 'fallback-value-3',
    section: 'value_creation',
    title: null,
    subtitle: null,
    content: 'Empleos creados en participadas',
    value: '+500',
    label: 'Empleos',
    icon: null,
    display_order: 32,
  },
  {
    id: 'fallback-value-4',
    section: 'value_creation',
    title: null,
    subtitle: null,
    content: 'Países de operación',
    value: '8',
    label: 'Países',
    icon: null,
    display_order: 33,
  },
  // ESG
  {
    id: 'fallback-esg',
    section: 'esg',
    title: 'Inversión Responsable',
    subtitle: 'Integramos criterios ESG en todas nuestras decisiones de inversión',
    content: 'Creemos que la sostenibilidad y la rentabilidad van de la mano. Trabajamos con nuestras participadas para implementar prácticas responsables que generen valor a largo plazo.',
    value: null,
    label: null,
    icon: 'Leaf',
    display_order: 40,
  },
];

// ==========================================
// PORTFOLIO COMPANIES FALLBACK
// ==========================================
export const fallbackPortfolioCompanies: PortfolioCompany[] = [
  {
    id: 'fallback-company-1',
    name: 'TechFlow Solutions',
    slug: 'techflow-solutions',
    description: 'Plataforma B2B SaaS líder en automatización de procesos empresariales',
    logo_url: null,
    website_url: 'https://example.com',
    sector: 'Tecnología',
    stage: 'Growth',
    country: 'España',
    founded_year: 2018,
    investment_date: '2022-06-15',
    investment_thesis: 'Digitalización de procesos empresariales con IA generativa',
    metrics: {
      revenue: '€25M ARR',
      employees: '150+',
      valuation: '€200M',
    },
    timeline: [
      { date: '2024', event: 'Expansión a Latinoamérica' },
      { date: '2023', event: 'Serie B completada' },
      { date: '2022', event: 'Inversión inicial' },
    ],
    is_active: true,
    is_featured: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-company-2',
    name: 'EduNext Academy',
    slug: 'edunext-academy',
    description: 'Plataforma de aprendizaje digital para formación profesional',
    logo_url: null,
    website_url: 'https://example.com',
    sector: 'Educación',
    stage: 'Growth',
    country: 'España',
    founded_year: 2019,
    investment_date: '2023-03-01',
    investment_thesis: 'Transformación digital de la educación profesional',
    metrics: {
      revenue: '€15M ARR',
      employees: '100+',
    },
    timeline: [
      { date: '2024', event: '50+ universidades asociadas' },
      { date: '2023', event: 'Inversión inicial' },
    ],
    is_active: true,
    is_featured: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-company-3',
    name: 'ConsumerBrands Group',
    slug: 'consumerbrands-group',
    description: 'Holding de marcas premium en salud y bienestar',
    logo_url: null,
    website_url: 'https://example.com',
    sector: 'Consumo',
    stage: 'Buy-and-build',
    country: 'Portugal',
    founded_year: 2020,
    investment_date: '2023-09-01',
    investment_thesis: 'Consolidación del mercado de bienestar premium',
    metrics: {
      revenue: '€80M',
      employees: '400+',
    },
    timeline: [
      { date: '2024', event: 'Adquisición de 3ª marca' },
      { date: '2023', event: 'Plataforma inicial' },
    ],
    is_active: true,
    is_featured: false,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-company-4',
    name: 'ServiceTech Pro',
    slug: 'servicetech-pro',
    description: 'Digitalización de servicios profesionales con IA',
    logo_url: null,
    website_url: 'https://example.com',
    sector: 'Servicios',
    stage: 'Growth',
    country: 'España',
    founded_year: 2017,
    investment_date: '2022-01-15',
    investment_thesis: 'IA aplicada a servicios profesionales',
    metrics: {
      revenue: '€20M ARR',
      employees: '120+',
    },
    timeline: [],
    is_active: true,
    is_featured: false,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Filter options fallback
export const fallbackFilterOptions = {
  sectors: ['Tecnología', 'Educación', 'Consumo', 'Servicios'],
  stages: ['Growth', 'Buy-and-build'],
  countries: ['España', 'Portugal'],
};

// ==========================================
// TEAM MEMBERS FALLBACK
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
    name: 'Equipo Directivo',
    position: 'Socio Director',
    email: null,
    linkedin_url: null,
    image_url: null,
    bio: 'Más de 20 años de experiencia en private equity y M&A. Liderando operaciones de crecimiento y consolidación.',
    section: 'Dirección',
    display_order: 1,
  },
  {
    id: 'fallback-team-2',
    name: 'Equipo de Inversiones',
    position: 'Director de Inversiones',
    email: null,
    linkedin_url: null,
    image_url: null,
    bio: 'Especialista en análisis de oportunidades y due diligence. Experiencia en operaciones mid-market.',
    section: 'Inversiones',
    display_order: 2,
  },
  {
    id: 'fallback-team-3',
    name: 'Equipo de Operaciones',
    position: 'Director de Operaciones',
    email: null,
    linkedin_url: null,
    image_url: null,
    bio: 'Experto en mejora operativa y creación de valor. Trayectoria en consultoría estratégica.',
    section: 'Operaciones',
    display_order: 3,
  },
  {
    id: 'fallback-team-4',
    name: 'Equipo de Análisis',
    position: 'Analista Senior',
    email: null,
    linkedin_url: null,
    image_url: null,
    bio: 'Análisis financiero y modelización. Apoyo en todas las fases del proceso de inversión.',
    section: 'Análisis',
    display_order: 4,
  },
];
