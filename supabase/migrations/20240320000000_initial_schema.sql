-- 创建用户表
create table if not exists public.users (
  id uuid references auth.users primary key,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 创建算法服务表
create table if not exists public.algorithms (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  api_endpoint text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 创建用户订阅表
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  algorithm_id uuid references public.algorithms(id),
  status text,
  stripe_subscription_id text,
  stripe_customer_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 创建算法调用记录表
create table if not exists public.algorithm_calls (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id),
  algorithm_id uuid references public.algorithms(id),
  input_data jsonb,
  output_data jsonb,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 创建 RLS 策略
alter table public.users enable row level security;
alter table public.algorithms enable row level security;
alter table public.subscriptions enable row level security;
alter table public.algorithm_calls enable row level security;

-- 用户表策略
create policy "用户可以查看自己的信息"
  on public.users for select
  using (auth.uid() = id);

create policy "用户可以更新自己的信息"
  on public.users for update
  using (auth.uid() = id);

-- 算法服务表策略
create policy "所有人可以查看算法服务"
  on public.algorithms for select
  to authenticated
  using (true);

-- 订阅表策略
create policy "用户可以查看自己的订阅"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "用户可以创建订阅"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "用户可以更新自己的订阅"
  on public.subscriptions for update
  using (auth.uid() = user_id);

-- 算法调用记录表策略
create policy "用户可以查看自己的调用记录"
  on public.algorithm_calls for select
  using (auth.uid() = user_id);

create policy "用户可以创建调用记录"
  on public.algorithm_calls for insert
  with check (auth.uid() = user_id);

-- 创建触发器函数
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- 创建触发器
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 