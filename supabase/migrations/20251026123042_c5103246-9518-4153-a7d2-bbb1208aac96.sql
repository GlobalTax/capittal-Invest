-- Create portfolio_companies table with full-text search
CREATE TABLE IF NOT EXISTS public.portfolio_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  sector TEXT NOT NULL,
  stage TEXT NOT NULL,
  country TEXT NOT NULL,
  founded_year INTEGER,
  investment_date DATE,
  investment_thesis TEXT,
  metrics JSONB DEFAULT '{}',
  timeline JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  search_vector tsvector,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create news_articles table with full-text search
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author_name TEXT NOT NULL DEFAULT 'Ethos Ventures',
  author_avatar_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  read_time INTEGER DEFAULT 5,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  search_vector tsvector,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create function to update search_vector for portfolio_companies
CREATE OR REPLACE FUNCTION public.update_portfolio_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.sector, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.investment_thesis, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.country, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update search_vector for news_articles
CREATE OR REPLACE FUNCTION public.update_news_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic search vector updates
CREATE TRIGGER portfolio_search_vector_update
  BEFORE INSERT OR UPDATE ON public.portfolio_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_portfolio_search_vector();

CREATE TRIGGER news_search_vector_update
  BEFORE INSERT OR UPDATE ON public.news_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_news_search_vector();

-- Create GIN indexes for fast full-text search
CREATE INDEX IF NOT EXISTS idx_portfolio_search 
  ON public.portfolio_companies USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_news_search 
  ON public.news_articles USING GIN(search_vector);

-- Create additional indexes for filtering
CREATE INDEX IF NOT EXISTS idx_portfolio_sector 
  ON public.portfolio_companies(sector);

CREATE INDEX IF NOT EXISTS idx_portfolio_stage 
  ON public.portfolio_companies(stage);

CREATE INDEX IF NOT EXISTS idx_portfolio_country 
  ON public.portfolio_companies(country);

CREATE INDEX IF NOT EXISTS idx_portfolio_active 
  ON public.portfolio_companies(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_news_published 
  ON public.news_articles(is_published, published_at DESC) 
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_news_category 
  ON public.news_articles(category);

CREATE INDEX IF NOT EXISTS idx_news_tags 
  ON public.news_articles USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE public.portfolio_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_companies
CREATE POLICY "Anyone can view active portfolio companies"
  ON public.portfolio_companies
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage portfolio companies"
  ON public.portfolio_companies
  FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- RLS Policies for news_articles
CREATE POLICY "Anyone can view published news articles"
  ON public.news_articles
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage news articles"
  ON public.news_articles
  FOR ALL
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- Create function for combined portfolio search with filters
CREATE OR REPLACE FUNCTION public.search_portfolio_companies(
  search_query TEXT DEFAULT NULL,
  filter_sector TEXT DEFAULT NULL,
  filter_stage TEXT DEFAULT NULL,
  filter_country TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  sector TEXT,
  stage TEXT,
  country TEXT,
  founded_year INTEGER,
  investment_date DATE,
  investment_thesis TEXT,
  metrics JSONB,
  timeline JSONB,
  is_featured BOOLEAN,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.name,
    pc.slug,
    pc.description,
    pc.logo_url,
    pc.website_url,
    pc.sector,
    pc.stage,
    pc.country,
    pc.founded_year,
    pc.investment_date,
    pc.investment_thesis,
    pc.metrics,
    pc.timeline,
    pc.is_featured,
    CASE 
      WHEN search_query IS NOT NULL AND search_query != '' THEN
        ts_rank(pc.search_vector, websearch_to_tsquery('english', search_query))
      ELSE 0
    END AS relevance
  FROM public.portfolio_companies pc
  WHERE pc.is_active = true
    AND (search_query IS NULL OR search_query = '' OR 
         pc.search_vector @@ websearch_to_tsquery('english', search_query))
    AND (filter_sector IS NULL OR pc.sector = filter_sector)
    AND (filter_stage IS NULL OR pc.stage = filter_stage)
    AND (filter_country IS NULL OR pc.country = filter_country)
  ORDER BY 
    pc.is_featured DESC,
    CASE WHEN search_query IS NOT NULL AND search_query != '' THEN
      ts_rank(pc.search_vector, websearch_to_tsquery('english', search_query))
    ELSE 0 END DESC,
    pc.display_order ASC,
    pc.name ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Create function for combined news search with filters
CREATE OR REPLACE FUNCTION public.search_news_articles(
  search_query TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL,
  filter_tags TEXT[] DEFAULT NULL,
  limit_count INTEGER DEFAULT 10,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  content TEXT,
  featured_image_url TEXT,
  author_name TEXT,
  author_avatar_url TEXT,
  category TEXT,
  tags TEXT[],
  read_time INTEGER,
  is_featured BOOLEAN,
  published_at TIMESTAMPTZ,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    na.id,
    na.title,
    na.slug,
    na.excerpt,
    na.content,
    na.featured_image_url,
    na.author_name,
    na.author_avatar_url,
    na.category,
    na.tags,
    na.read_time,
    na.is_featured,
    na.published_at,
    CASE 
      WHEN search_query IS NOT NULL AND search_query != '' THEN
        ts_rank(na.search_vector, websearch_to_tsquery('english', search_query))
      ELSE 0
    END AS relevance
  FROM public.news_articles na
  WHERE na.is_published = true
    AND (search_query IS NULL OR search_query = '' OR 
         na.search_vector @@ websearch_to_tsquery('english', search_query))
    AND (filter_category IS NULL OR na.category = filter_category)
    AND (filter_tags IS NULL OR na.tags && filter_tags)
  ORDER BY 
    na.is_featured DESC,
    CASE WHEN search_query IS NOT NULL AND search_query != '' THEN
      ts_rank(na.search_vector, websearch_to_tsquery('english', search_query))
    ELSE 0 END DESC,
    na.published_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Create function to get unique filter values for portfolio
CREATE OR REPLACE FUNCTION public.get_portfolio_filter_options()
RETURNS TABLE (
  sectors TEXT[],
  stages TEXT[],
  countries TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ARRAY_AGG(DISTINCT sector ORDER BY sector) AS sectors,
    ARRAY_AGG(DISTINCT stage ORDER BY stage) AS stages,
    ARRAY_AGG(DISTINCT country ORDER BY country) AS countries
  FROM public.portfolio_companies
  WHERE is_active = true;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Create function to get unique filter values for news
CREATE OR REPLACE FUNCTION public.get_news_filter_options()
RETURNS TABLE (
  categories TEXT[],
  all_tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ARRAY_AGG(DISTINCT category ORDER BY category) AS categories,
    ARRAY_AGG(DISTINCT tag ORDER BY tag) AS all_tags
  FROM public.news_articles,
  LATERAL unnest(tags) AS tag
  WHERE is_published = true;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_portfolio()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER portfolio_updated_at
  BEFORE UPDATE ON public.portfolio_companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_portfolio();

CREATE TRIGGER news_updated_at
  BEFORE UPDATE ON public.news_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_portfolio();