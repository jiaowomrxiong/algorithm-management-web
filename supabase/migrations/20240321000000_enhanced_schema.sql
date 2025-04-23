-- 创建执行 SQL 的函数
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建用户角色枚举
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
  END IF;
END $$;

-- 创建用户表
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建算法服务表
CREATE TABLE IF NOT EXISTS public.algorithms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  api_endpoint TEXT,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建用户订阅表
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  algorithm_id UUID REFERENCES public.algorithms(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, algorithm_id)
);

-- 创建算法调用记录表
CREATE TABLE IF NOT EXISTS public.algorithm_calls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  algorithm_id UUID REFERENCES public.algorithms(id) NOT NULL,
  input_data JSONB,
  output_data JSONB,
  execution_time INTEGER, -- 毫秒
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建新用户触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ language plpgsql security definer;

-- 创建触发器
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_algorithms_updated_at
  BEFORE UPDATE ON public.algorithms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 启用行级安全
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.algorithms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.algorithm_calls ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "用户可以查看自己的信息"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "管理员可以查看所有用户"
  ON public.users FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.id IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  ));

CREATE POLICY "用户可以更新自己的信息"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 算法服务表策略
CREATE POLICY "所有人可以查看算法服务"
  ON public.algorithms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "只有管理员可以创建算法"
  ON public.algorithms FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "只有管理员可以更新算法"
  ON public.algorithms FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND role = 'admin'
  ));

-- 订阅表策略
CREATE POLICY "用户可以查看自己的订阅"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "管理员可以查看所有订阅"
  ON public.subscriptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "用户可以创建订阅"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的订阅"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- 算法调用记录表策略
CREATE POLICY "用户可以查看自己的调用记录"
  ON public.algorithm_calls FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "管理员可以查看所有调用记录"
  ON public.algorithm_calls FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "用户可以创建调用记录"
  ON public.algorithm_calls FOR INSERT
  WITH CHECK (auth.uid() = user_id); 