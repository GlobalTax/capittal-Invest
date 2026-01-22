-- =============================================
-- PORTAL DEL INVERSOR - Migración Principal
-- =============================================

-- 1. Usuarios inversores (vinculados a LPs)
CREATE TABLE public.investor_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lp_id UUID REFERENCES cr_lps(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  invited_by UUID,
  invited_at TIMESTAMPTZ,
  invitation_token TEXT UNIQUE,
  invitation_expires_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Documentos específicos para inversores (Data Room)
CREATE TABLE public.investor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID REFERENCES cr_funds(id) ON DELETE CASCADE,
  lp_id UUID REFERENCES cr_lps(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('capital_call', 'distribution', 'k1', 'quarterly_report', 'annual_report', 'legal', 'tax', 'other')),
  quarter TEXT,
  year INTEGER,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  file_size_bytes BIGINT,
  is_confidential BOOLEAN DEFAULT false,
  requires_signature BOOLEAN DEFAULT false,
  signature_status TEXT CHECK (signature_status IN ('pending', 'signed', 'rejected', NULL)),
  published_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Métricas de performance de fondos
CREATE TABLE public.investor_fund_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID REFERENCES cr_funds(id) ON DELETE CASCADE NOT NULL,
  period_date DATE NOT NULL,
  nav NUMERIC,
  irr_net NUMERIC,
  irr_gross NUMERIC,
  moic NUMERIC,
  dpi NUMERIC,
  rvpi NUMERIC,
  tvpi NUMERIC,
  total_committed NUMERIC,
  total_called NUMERIC,
  total_distributed NUMERIC,
  unfunded_commitment NUMERIC,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(fund_id, period_date)
);

-- 4. Posiciones individuales de cada inversor
CREATE TABLE public.investor_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_user_id UUID REFERENCES investor_users(id) ON DELETE CASCADE NOT NULL,
  fund_id UUID REFERENCES cr_funds(id) ON DELETE CASCADE NOT NULL,
  committed_capital NUMERIC NOT NULL DEFAULT 0,
  called_capital NUMERIC NOT NULL DEFAULT 0,
  distributed_capital NUMERIC NOT NULL DEFAULT 0,
  current_nav NUMERIC NOT NULL DEFAULT 0,
  ownership_percentage NUMERIC,
  investment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(investor_user_id, fund_id)
);

-- 5. Log de acceso a documentos
CREATE TABLE public.investor_document_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES investor_documents(id) ON DELETE CASCADE NOT NULL,
  investor_user_id UUID REFERENCES investor_users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'download')),
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Notificaciones para inversores
CREATE TABLE public.investor_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_user_id UUID REFERENCES investor_users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT NOT NULL CHECK (type IN ('document', 'capital_call', 'distribution', 'report', 'general')),
  related_document_id UUID REFERENCES investor_documents(id) ON DELETE SET NULL,
  related_fund_id UUID REFERENCES cr_funds(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX idx_investor_users_user_id ON investor_users(user_id);
CREATE INDEX idx_investor_users_lp_id ON investor_users(lp_id);
CREATE INDEX idx_investor_users_status ON investor_users(status);
CREATE INDEX idx_investor_users_email ON investor_users(email);

CREATE INDEX idx_investor_documents_fund_id ON investor_documents(fund_id);
CREATE INDEX idx_investor_documents_lp_id ON investor_documents(lp_id);
CREATE INDEX idx_investor_documents_category ON investor_documents(category);
CREATE INDEX idx_investor_documents_year ON investor_documents(year);

CREATE INDEX idx_investor_fund_metrics_fund_id ON investor_fund_metrics(fund_id);
CREATE INDEX idx_investor_fund_metrics_period ON investor_fund_metrics(period_date);

CREATE INDEX idx_investor_positions_investor ON investor_positions(investor_user_id);
CREATE INDEX idx_investor_positions_fund ON investor_positions(fund_id);

CREATE INDEX idx_investor_notifications_user ON investor_notifications(investor_user_id);
CREATE INDEX idx_investor_notifications_unread ON investor_notifications(investor_user_id) WHERE is_read = false;

-- =============================================
-- TRIGGERS para updated_at
-- =============================================
CREATE TRIGGER update_investor_users_updated_at
  BEFORE UPDATE ON investor_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_documents_updated_at
  BEFORE UPDATE ON investor_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_fund_metrics_updated_at
  BEFORE UPDATE ON investor_fund_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_positions_updated_at
  BEFORE UPDATE ON investor_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE investor_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_fund_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_document_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS PARA INVERSORES
-- =============================================

-- investor_users: Los inversores solo ven su propio perfil
CREATE POLICY "Investors can view own profile"
  ON investor_users FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Investors can update own profile"
  ON investor_users FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- investor_documents: Inversores ven documentos de sus fondos
CREATE POLICY "Investors can view their fund documents"
  ON investor_documents FOR SELECT
  USING (
    published_at IS NOT NULL 
    AND published_at <= now()
    AND (
      -- El documento es para el fondo del inversor
      fund_id IN (
        SELECT ip.fund_id 
        FROM investor_positions ip
        JOIN investor_users iu ON ip.investor_user_id = iu.id
        WHERE iu.user_id = auth.uid() AND iu.status = 'active'
      )
      AND (
        -- Y es para todos los LPs del fondo (lp_id IS NULL) o específicamente para este LP
        lp_id IS NULL 
        OR lp_id = (SELECT lp_id FROM investor_users WHERE user_id = auth.uid())
      )
    )
  );

-- investor_fund_metrics: Inversores ven métricas de sus fondos
CREATE POLICY "Investors can view their fund metrics"
  ON investor_fund_metrics FOR SELECT
  USING (
    fund_id IN (
      SELECT ip.fund_id 
      FROM investor_positions ip
      JOIN investor_users iu ON ip.investor_user_id = iu.id
      WHERE iu.user_id = auth.uid() AND iu.status = 'active'
    )
  );

-- investor_positions: Inversores ven sus propias posiciones
CREATE POLICY "Investors can view own positions"
  ON investor_positions FOR SELECT
  USING (
    investor_user_id = (
      SELECT id FROM investor_users WHERE user_id = auth.uid()
    )
  );

-- investor_document_access: Inversores pueden ver y crear sus propios logs
CREATE POLICY "Investors can view own document access"
  ON investor_document_access FOR SELECT
  USING (
    investor_user_id = (
      SELECT id FROM investor_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Investors can log document access"
  ON investor_document_access FOR INSERT
  WITH CHECK (
    investor_user_id = (
      SELECT id FROM investor_users WHERE user_id = auth.uid()
    )
  );

-- investor_notifications: Inversores ven y actualizan sus propias notificaciones
CREATE POLICY "Investors can view own notifications"
  ON investor_notifications FOR SELECT
  USING (
    investor_user_id = (
      SELECT id FROM investor_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Investors can mark own notifications as read"
  ON investor_notifications FOR UPDATE
  USING (
    investor_user_id = (
      SELECT id FROM investor_users WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    investor_user_id = (
      SELECT id FROM investor_users WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- POLÍTICAS PARA ADMINS
-- =============================================

-- Función helper para verificar si es admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- investor_users: Admins tienen acceso completo
CREATE POLICY "Admins can manage all investor users"
  ON investor_users FOR ALL
  USING (is_admin_user());

-- investor_documents: Admins tienen acceso completo
CREATE POLICY "Admins can manage all investor documents"
  ON investor_documents FOR ALL
  USING (is_admin_user());

-- investor_fund_metrics: Admins tienen acceso completo
CREATE POLICY "Admins can manage all fund metrics"
  ON investor_fund_metrics FOR ALL
  USING (is_admin_user());

-- investor_positions: Admins tienen acceso completo
CREATE POLICY "Admins can manage all investor positions"
  ON investor_positions FOR ALL
  USING (is_admin_user());

-- investor_document_access: Admins pueden ver todos los logs
CREATE POLICY "Admins can view all document access logs"
  ON investor_document_access FOR SELECT
  USING (is_admin_user());

-- investor_notifications: Admins tienen acceso completo
CREATE POLICY "Admins can manage all notifications"
  ON investor_notifications FOR ALL
  USING (is_admin_user());