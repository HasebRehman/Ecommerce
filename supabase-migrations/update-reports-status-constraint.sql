-- Drop old constraint and add updated one with all valid statuses
ALTER TABLE public.reports
  DROP CONSTRAINT IF EXISTS reports_status_check;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_status_check
  CHECK (status IN (
    'delivered',
    'reviewing',
    'neglected',
    'warning_issued',
    'seller_banned'
  ));