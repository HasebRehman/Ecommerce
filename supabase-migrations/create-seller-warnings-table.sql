-- Seller Warnings table
-- Created when admin issues a warning action on a report

CREATE TABLE IF NOT EXISTS public.seller_warnings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id   uuid REFERENCES public.reports(id) ON DELETE SET NULL,
  shop_id     uuid REFERENCES public.shops(id) ON DELETE SET NULL,
  product_id  uuid REFERENCES public.products(id) ON DELETE SET NULL,
  reason      text NOT NULL,
  message     text NOT NULL,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.seller_warnings ENABLE ROW LEVEL SECURITY;

-- Sellers can only read their own warnings
CREATE POLICY "Sellers can view own warnings"
  ON public.seller_warnings FOR SELECT
  USING (auth.uid() = seller_id);

-- Admins can insert warnings (service role bypasses RLS anyway)
CREATE POLICY "Admins can insert warnings"
  ON public.seller_warnings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'platform_admin', 'operations_admin')
    )
  );

-- Sellers can mark their own warnings as read
CREATE POLICY "Sellers can update own warnings"
  ON public.seller_warnings FOR UPDATE
  USING (auth.uid() = seller_id);

-- Indexes
CREATE INDEX IF NOT EXISTS seller_warnings_seller_id_idx ON public.seller_warnings(seller_id);
CREATE INDEX IF NOT EXISTS seller_warnings_created_at_idx ON public.seller_warnings(created_at DESC);
CREATE INDEX IF NOT EXISTS seller_warnings_is_read_idx ON public.seller_warnings(is_read) WHERE is_read = false;
