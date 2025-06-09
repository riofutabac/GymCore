import './globals.css'

export const metadata = {
  title: 'GymCore - Sistema de Gestión de Gimnasios',
  description: 'Plataforma integral para la gestión de gimnasios',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head />
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
