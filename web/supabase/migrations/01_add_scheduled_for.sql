-- Add scheduled_for column to orders table
alter table public.orders add column scheduled_for date default CURRENT_DATE;

-- Update existing orders to have a scheduled_for date (based on their created_at)
update public.orders set scheduled_for = created_at::date where scheduled_for is null;
