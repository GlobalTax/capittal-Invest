export interface PortfolioCompany {
  id: string;
  name: string;
  website: string;
  country: string;
  sector: string;
  stage: string;
  thesis: string;
  metrics?: {
    revenue?: string;
    employees?: string;
    valuation?: string;
  };
  timeline?: Array<{
    date: string;
    event: string;
  }>;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  linkedin: string;
}

export interface Insight {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
}

export const portfolioCompanies: PortfolioCompany[] = [
  {
    id: "1",
    name: "TechFlow",
    website: "https://techflow.example.com",
    country: "United States",
    sector: "Technology",
    stage: "Growth",
    thesis: "Leading B2B SaaS platform automating enterprise workflows",
    metrics: {
      revenue: "$50M ARR",
      employees: "200+",
      valuation: "$500M",
    },
    timeline: [
      { date: "2024", event: "Series C funding" },
      { date: "2023", event: "Expanded to EMEA" },
      { date: "2022", event: "Initial investment" },
    ],
  },
  {
    id: "2",
    name: "EduNext",
    website: "https://edunext.example.com",
    country: "Spain",
    sector: "Education",
    stage: "Growth",
    thesis: "Digital learning platform transforming higher education",
    metrics: {
      revenue: "$25M ARR",
      employees: "150+",
    },
    timeline: [
      { date: "2024", event: "Partnership with 50+ universities" },
      { date: "2023", event: "Initial investment" },
    ],
  },
  {
    id: "3",
    name: "ConsumerCo",
    website: "https://consumerco.example.com",
    country: "United Kingdom",
    sector: "Consumer",
    stage: "Buy-and-build",
    thesis: "Consolidating premium health & wellness brands",
    metrics: {
      revenue: "$100M",
      employees: "500+",
    },
    timeline: [
      { date: "2024", event: "Acquired 3rd brand" },
      { date: "2023", event: "Platform investment" },
    ],
  },
  {
    id: "4",
    name: "ServiceTech",
    website: "https://servicetech.example.com",
    country: "Germany",
    sector: "Services",
    stage: "Growth",
    thesis: "Digitizing professional services with AI",
    metrics: {
      revenue: "$30M ARR",
      employees: "180+",
    },
  },
];

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Mitchell",
    role: "Managing Partner",
    bio: "20+ years in growth equity, former Goldman Sachs",
    linkedin: "https://linkedin.com/in/sarahmitchell",
  },
  {
    id: "2",
    name: "James Chen",
    role: "Partner",
    bio: "Tech investor, ex-McKinsey, Stanford MBA",
    linkedin: "https://linkedin.com/in/jameschen",
  },
  {
    id: "3",
    name: "Maria Rodriguez",
    role: "Partner",
    bio: "Consumer & education specialist, 15 years PE experience",
    linkedin: "https://linkedin.com/in/mariarodriguez",
  },
  {
    id: "4",
    name: "Thomas Berg",
    role: "Principal",
    bio: "Operations expert, built 2 successful startups",
    linkedin: "https://linkedin.com/in/thomasberg",
  },
];

export const insights: Insight[] = [
  {
    slug: "future-of-b2b-saas",
    title: "The Future of B2B SaaS: Vertical Integration",
    excerpt: "Why vertical-specific solutions are winning in enterprise software",
    content: "The B2B SaaS landscape is undergoing a fundamental shift...",
    author: "James Chen",
    date: "2025-01-15",
    readTime: "8 min read",
    category: "Technology",
  },
  {
    slug: "building-consumer-brands",
    title: "Building Consumer Brands in 2025",
    excerpt: "Key lessons from our portfolio on brand-building in the digital age",
    content: "Consumer behavior has transformed dramatically...",
    author: "Maria Rodriguez",
    date: "2025-01-08",
    readTime: "6 min read",
    category: "Consumer",
  },
  {
    slug: "operational-excellence",
    title: "Operational Excellence: The Hidden Driver of Returns",
    excerpt: "How our playbook approach creates value beyond capital",
    content: "In growth equity, operational improvements often drive more value than financial engineering...",
    author: "Thomas Berg",
    date: "2024-12-20",
    readTime: "10 min read",
    category: "Strategy",
  },
];
