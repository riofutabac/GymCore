
-- Eliminar trigger y función si existen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Función mejorada para insertar usuario en la tabla public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_name TEXT;
  user_role TEXT;
BEGIN
  -- Extraer nombre y rol de los metadatos
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  
  user_role := COALESCE(
    NEW.raw_user_meta_data->>'role',
    'CLIENT'
  );

  -- Insertar en la tabla public.users
  INSERT INTO public.users (
    id, 
    email, 
    name, 
    role,
    "isActive",
    "emailVerified",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role::public."UserRole",
    true,
    NEW.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    "emailVerified" = EXCLUDED."emailVerified",
    "updatedAt" = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log del error (en un entorno real, podrías usar una tabla de logs)
    RAISE WARNING 'Error en handle_new_user: %', SQLERRM;
    -- No fallar el proceso de registro de Supabase
    RETURN NEW;
END;
$$;

-- Crear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necesarios para que funcione
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON TABLE public.users TO supabase_auth_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

-- Sincronizar usuarios existentes que no estén en public.users
INSERT INTO public.users (
  id, 
  email, 
  name, 
  role,
  "isActive",
  "emailVerified",
  "createdAt",
  "updatedAt"
)
SELECT 
  auth.users.id,
  auth.users.email,
  COALESCE(
    auth.users.raw_user_meta_data->>'name',
    auth.users.raw_user_meta_data->>'full_name',
    split_part(auth.users.email, '@', 1)
  ),
  COALESCE(
    auth.users.raw_user_meta_data->>'role',
    'CLIENT'
  )::public."UserRole",
  true,
  auth.users.email_confirmed_at IS NOT NULL,
  auth.users.created_at,
  auth.users.updated_at
FROM auth.users
WHERE auth.users.id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;
