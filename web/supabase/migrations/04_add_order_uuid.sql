-- Add uuid column to orders table for secure public access
alter table orders add column if not exists order_uuid uuid default gen_random_uuid() not null;

-- Create an index for faster lookups
create index if not exists orders_order_uuid_idx on orders(order_uuid);
