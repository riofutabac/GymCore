-- Trigger para sincronizar usuarios de auth.users a public.users
-- Este trigger se ejecuta después de insertar un nuevo usuario en auth.users

-- Eliminar trigger y función si existen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Función para insertar o actualizar usuario en la tabla public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Intentar insertar nuevo usuario
  INSERT INTO public.users (id, email, name, "role", "isActive")
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENT'),
    true
  )
  -- Si el usuario ya existe, actualizar sus datos
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    "emailVerified" = NEW.email_confirmed_at IS NOT NULL,
    "updatedAt" = NEW.updated_at;
  
  RETURN NEW;
END;
$$;

-- Crear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Comentario: Este trigger sincroniza automáticamente los usuarios creados en Supabase Auth
-- con la tabla public.users, manteniendo los campos necesarios para la aplicación GymCore.
