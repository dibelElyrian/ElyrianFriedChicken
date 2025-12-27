-- Add full_name column to profiles table
alter table profiles add column if not exists full_name text;

-- Update handle_new_user function to include metadata name if available (optional, but good practice)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, points, full_name)
  values (
    new.id, 
    new.email, 
    0,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;
