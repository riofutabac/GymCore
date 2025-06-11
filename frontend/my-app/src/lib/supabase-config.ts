export const supabaseConfig = {
  auth: {
    // La URL base de tu aplicación
    site_url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    // URLs permitidas para redirección después de autenticación
    redirectTo: process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
      : 'http://localhost:3000/reset-password',
  },
};
