/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
  // Solución específica para Windows ESM
  experimental: {
    esmExternals: false, // Desactivar ESM externals
  },
  webpack: (config, { isServer }) => {
    // Configuración específica para Windows
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Evitar problemas con rutas absolutas en Windows
    config.resolve.fullySpecified = false;
    
    return config;
  },
}

module.exports = nextConfig
