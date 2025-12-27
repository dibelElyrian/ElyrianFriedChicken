-- Create a function to prevent points update by users
create or replace function public.prevent_points_update()
returns trigger as $$
begin
  -- Check if the points column is being modified
  if new.points is distinct from old.points then
    -- Check if the user is a regular authenticated user (not service_role)
    -- We can check the role using auth.role()
    if auth.role() = 'authenticated' then
      raise exception 'You cannot update your points directly.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

-- Create the trigger
drop trigger if exists protect_points on profiles;
create trigger protect_points
  before update on profiles
  for each row execute procedure public.prevent_points_update();

-- Create secure functions for points management
-- These are security definer functions, meaning they run with the privileges of the creator (postgres/admin)
-- We must revoke execute permissions from public to prevent abuse via API

create or replace function public.increment_points(user_id uuid, amount int)
returns void as $$
begin
  update public.profiles
  set points = points + amount
  where id = user_id;
end;
$$ language plpgsql security definer;

create or replace function public.deduct_points(user_id uuid, amount int)
returns void as $$
begin
  update public.profiles
  set points = points - amount
  where id = user_id;
end;
$$ language plpgsql security definer;

-- Revoke execute permissions from public/anon/authenticated
revoke execute on function public.increment_points(uuid, int) from public;
revoke execute on function public.increment_points(uuid, int) from anon;
revoke execute on function public.increment_points(uuid, int) from authenticated;

revoke execute on function public.deduct_points(uuid, int) from public;
revoke execute on function public.deduct_points(uuid, int) from anon;
revoke execute on function public.deduct_points(uuid, int) from authenticated;

-- Grant execute to service_role (which supabaseAdmin uses)
grant execute on function public.increment_points(uuid, int) to service_role;
grant execute on function public.deduct_points(uuid, int) to service_role;
