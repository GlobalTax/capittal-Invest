-- Add public read access to cr_portfolio for anonymous users to see portfolio stats
CREATE POLICY "Public can view cr_portfolio" 
ON public.cr_portfolio 
FOR SELECT 
USING (true);