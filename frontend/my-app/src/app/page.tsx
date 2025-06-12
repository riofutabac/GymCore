"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function Home() {
	const [faqOpen, setFaqOpen] = useState<number | null>(null);

	useEffect(() => {
		const observerCallback = (entries: IntersectionObserverEntry[]) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("animate-in-show");
				}
			});
		};

		const observer = new IntersectionObserver(observerCallback, {
			threshold: 0.1,
		});

		document.querySelectorAll(".animate-in").forEach((el) => {
			observer.observe(el);
		});

		return () => observer.disconnect();
	}, []);

	const toggleFaq = (index: number) => {
		setFaqOpen(faqOpen === index ? null : index);
	};

	return (
		<div className="flex flex-col min-h-screen">
			<style jsx global>{`
				.animate-in {
					opacity: 0;
					transform: translateY(30px);
					transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
				}
				.animate-in-show {
					opacity: 1;
					transform: translateY(0);
				}
				.gradient-bg {
					background: linear-gradient(135deg, #000000 0%, #333333 100%);
				}
				.floating {
					animation: floating 6s ease-in-out infinite;
				}
				@keyframes floating {
					0% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-15px);
					}
					100% {
						transform: translateY(0px);
					}
				}
				.pulse {
					animation: pulse 2s infinite;
				}
				@keyframes pulse {
					0% {
						transform: scale(1);
					}
					50% {
						transform: scale(1.05);
					}
					100% {
						transform: scale(1);
					}
				}
			`}</style>

			{/* Header */}
			<header className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm">
				<div className="container mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center overflow-hidden">
								<Image
									src="/assets/img/logo.png"
									alt="GymCore Logo"
									width={32}
									height={32}
									className="w-8 h-8 object-contain"
								/>
							</div>
							<span className="text-2xl font-bold text-gray-800">
								GymCore
							</span>
						</div>
						<nav className="hidden md:flex items-center space-x-8">
							<a
								href="#features"
								className="text-gray-600 hover:text-black transition"
							>
								Características
							</a>
							<a
								href="#testimonials"
								className="text-gray-600 hover:text-black transition"
							>
								Clientes
							</a>
						</nav>
						<div className="flex items-center space-x-4">
							<Link
								href="/login"
								className="text-gray-600 hover:text-black transition hidden md:inline-block"
							>
								Iniciar Sesión
							</Link>
							<Link href="/register">
								<Button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition transform hover:scale-105 shadow-md">
									Registrarse
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="pt-32 pb-20 md:pt-40 md:pb-28 gradient-bg text-white overflow-hidden">
				<div className="container mx-auto px-6">
					<div className="flex flex-col md:flex-row items-center">
						<div className="md:w-1/2 mb-12 md:mb-0 animate-in">
							<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
								Transforma la gestión de tu{" "}
								<span className="text-gray-300">gimnasio</span> hoy
							</h1>
							<p className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg">
								La solución todo-en-uno para administrar miembros, controlar
								accesos y optimizar operaciones con tecnología inteligente.
							</p>
						</div>
						<div
							className="md:w-1/2 animate-in"
							style={{ transitionDelay: "0.2s" }}
						>
							<div className="relative floating">
								<div className="rounded-xl shadow-2xl border-8 border-white/20 bg-white p-4">
									<div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
										<Image
											src="/assets/img/carlos.jpg"
											alt="Dashboard GymCore"
											width={800}
											height={450}
											className="w-full h-full object-cover rounded-lg"
										/>
									</div>
								</div>
								<div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
									<div className="flex items-center">
										<div className="bg-green-100 p-2 rounded-full mr-3">
											<span className="text-green-600">✓</span>
										</div>
										<p className="text-sm font-medium text-gray-800">
											Membresía activa
										</p>
									</div>
								</div>
								<div className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
									<div className="flex items-center">
										<div className="bg-black p-2 rounded-full mr-3">
											<span className="text-white">+</span>
										</div>
										<p className="text-sm font-medium text-gray-800">
											+15 nuevos hoy
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section id="features" className="py-20 bg-gray-50">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16 animate-in">
						<span className="text-black font-semibold">POTENCIA TU GIMNASIO</span>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2 mb-4">
							Características diseñadas para el éxito
						</h2>
						<p className="text-gray-600 max-w-2xl mx-auto">
							Todo lo que necesitas para administrar, crecer y optimizar tu
							gimnasio en una sola plataforma.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						<Card
							className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in"
							style={{ transitionDelay: "0.1s" }}
						>
							<CardContent className="p-8">
								<div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
									<span className="text-black text-2xl">👥</span>
								</div>
								<h3 className="text-xl font-bold text-gray-800 mb-3">
									Gestión de Miembros
								</h3>
								<p className="text-gray-600 mb-4">
									Administra perfiles, historiales médicos, progresos y
									membresías de todos tus clientes en un solo lugar.
								</p>
								<ul className="space-y-2">
									<li className="flex items-center">
										<span className="text-green-500 mr-2">✓</span>
										<span className="text-gray-600">Registro y seguimiento</span>
									</li>
									<li className="flex items-center">
										<span className="text-green-500 mr-2">✓</span>
										<span className="text-gray-600">
											Notificaciones automáticas
										</span>
									</li>
									<li className="flex items-center">
										<span className="text-green-500 mr-2">✓</span>
										<span className="text-gray-600">Historial completo</span>
									</li>
								</ul>
							</CardContent>
						</Card>

						<Card
							className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in"
							style={{ transitionDelay: "0.2s" }}
						>
							<CardContent className="p-8">
								<div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
									<span className="text-black text-2xl">📱</span>
								</div>
								<h3 className="text-xl font-bold text-gray-800 mb-3">
									Control de Acceso QR
								</h3>
								<p className="text-gray-600 mb-4">
									Sistema de acceso seguro mediante códigos QR únicos para cada
									miembro, con registro en tiempo real.
								</p>
								<ul className="space-y-2">
									<li className="flex items-center">
										<span className="text-green-500 mr-2">✓</span>
										<span className="text-gray-600">Acceso sin contacto</span>
									</li>
									<li className="flex items-center">
										<span className="text-green-500 mr-2">✓</span>
										<span className="text-gray-600">Verificación instantánea</span>
									</li>
									<li className="flex items-center">
										<span className="text-green-500 mr-2">✓</span>
										<span className="text-gray-600">Reportes de asistencia</span>
									</li>
								</ul>
							</CardContent>
						</Card>

						<Card
							className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in"
							style={{ transitionDelay: "0.3s" }}
						>
							<CardContent className="p-8">
								<div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
									<span className="text-black text-2xl">📊</span>
								</div>
								<h3 className="text-xl font-bold text-gray-800 mb-3">
									Analíticas Avanzadas
								</h3>
								<p className="text-gray-600 mb-4">
									Métricas clave y reportes personalizados para entender el
									crecimiento y rendimiento de tu negocio.
								</p>
								<ul className="space-y-2">
									<li className="flex items-center">
										<span className="text-green-500 mr-2">✓</span>
										<span className="text-gray-600">Asistencia por horarios</span>
									</li>
									<li className="flex items-center">
										<span className="text-green-500 mr-2">✓</span>
										<span className="text-gray-600">Ingresos y proyecciones</span>
									</li>
									<li className="flex items-center">
										<span className="text-green-500 mr-2">✓</span>
										<span className="text-gray-600">Exportación de datos</span>
									</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section id="testimonials" className="py-20 bg-black text-white">
				<div className="container mx-auto px-6">
					<div className="text-center mb-16 animate-in">
						<span className="text-gray-400 font-semibold">HISTORIAS DE ÉXITO</span>
						<h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
							Lo que dicen nuestros clientes
						</h2>
						<p className="text-gray-300 max-w-2xl mx-auto">
							Gimnasios de todo el mundo han transformado sus operaciones con
							GymCore.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						<Card
							className="bg-gray-800 border-gray-700 animate-in"
							style={{ transitionDelay: "0.1s" }}
						>
							<CardContent className="p-8">
								<div className="flex items-center mb-6">
									<Image
										src="/assets/img/carlos.jpg"
										alt="Carlos Bayas"
										width={48}
										height={48}
										className="w-12 h-12 rounded-full mr-4 object-cover"
									/>
									<div>
										<h4 className="font-bold text-white">Carlos Bayas</h4>
										<p className="text-gray-400 text-sm">
											Dueño, IronFit Gym
										</p>
									</div>
								</div>
								<p className="text-gray-300 mb-6">
									"Desde que implementamos GymCore, hemos reducido el tiempo de
									administración en un 70%. El sistema de acceso QR fue un cambio
									radical para nosotros."
								</p>
								<div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
							</CardContent>
						</Card>

						<Card
							className="bg-gray-800 border-gray-700 animate-in"
							style={{ transitionDelay: "0.2s" }}
						>
							<CardContent className="p-8">
								<div className="flex items-center mb-6">
									<Image
										src="/assets/img/andres.jpg"
										alt="Andrés Cantuña"
										width={48}
										height={48}
										className="w-12 h-12 rounded-full mr-4 object-cover"
									/>
									<div>
										<h4 className="font-bold text-white">Andrés Cantuña</h4>
										<p className="text-gray-400 text-sm">
											Gerente, PowerHealth
										</p>
									</div>
								</div>
								<p className="text-gray-300 mb-6">
									"Las analíticas nos han permitido entender los patrones de
									nuestros miembros y optimizar nuestros horarios. Incrementamos
									nuestra retención en un 40% el primer mes."
								</p>
								<div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
							</CardContent>
						</Card>

						<Card
							className="bg-gray-800 border-gray-700 animate-in"
							style={{ transitionDelay: "0.3s" }}
						>
							<CardContent className="p-8">
								<div className="flex items-center mb-6">
									<Image
										src="/assets/img/marco.jpg"
										alt="Marco Marquez"
										width={48}
										height={48}
										className="w-12 h-12 rounded-full mr-4 object-cover"
									/>
									<div>
										<h4 className="font-bold text-white">Marco Marquez</h4>
										<p className="text-gray-400 text-sm">
											CEO, FitNation
										</p>
									</div>
								</div>
								<p className="text-gray-300 mb-6">
									"La integración con nuestro sistema de pagos fue impecable.
									Ahora todo está centralizado y podemos enfocarnos en lo que
									realmente importa: nuestros clientes."
								</p>
								<div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
							</CardContent>
						</Card>
					</div>

					<div
						className="mt-16 text-center animate-in"
						style={{ transitionDelay: "0.4s" }}
					>
						<Link href="/register">
							<Button className="bg-white hover:bg-gray-100 text-black font-bold px-8 py-4 rounded-lg text-lg transition transform hover:scale-105">
								Comienza tu prueba gratuita
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Soporte 24/7 Section */}
			<section className="py-20 bg-white">
				<div className="container mx-auto px-6">
					<div className="max-w-xl mx-auto animate-in" style={{ transitionDelay: "0.1s" }}>
						<div className="rounded-xl shadow-lg bg-gray-100 flex items-center justify-center p-8 relative">
							<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white p-4 rounded-full shadow-lg">
								<span className="text-3xl">🎧</span>
							</div>
							<div className="ml-0 mt-8 text-center">
								<h4 className="font-bold text-gray-800 mb-2 text-2xl">Soporte 24/7 por chat</h4>
								<p className="text-gray-600 text-lg">
									Nuestro equipo está listo para ayudarte en cualquier momento.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-black text-gray-300 py-12">
				<div className="container mx-auto px-6">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div
							className="animate-in"
							style={{ transitionDelay: "0.1s" }}
						>
							<div className="flex items-center space-x-2 mb-4">
								<div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden">
									<Image
										src="/assets/img/logo.png"
										alt="GymCore Logo"
										width={32}
										height={32}
										className="w-8 h-8 object-contain"
									/>
								</div>
								<span className="text-2xl font-bold text-white">GymCore</span>
							</div>
							<p className="mb-4">
								La plataforma líder en gestión de gimnasios para negocios de todos
								los tamaños.
							</p>
						</div>

						<div
							className="animate-in"
							style={{ transitionDelay: "0.2s" }}
						>
							<h3 className="text-white font-bold text-lg mb-4">Producto</h3>
							<ul className="space-y-2">
								<li>
									<a
										href="#features"
										className="hover:text-white transition"
									>
										Características
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-white transition"
									>
										Integraciones
									</a>
								</li>
							</ul>
						</div>

						<div
							className="animate-in"
							style={{ transitionDelay: "0.3s" }}
						>
							<h3 className="text-white font-bold text-lg mb-4">Recursos</h3>
							<ul className="space-y-2">
								<li>
									<a
										href="#"
										className="hover:text-white transition"
									>
										Blog
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-white transition"
									>
										Guías
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:text-white transition"
									>
										Centro de Ayuda
									</a>
								</li>
							</ul>
						</div>

						<div
							className="animate-in"
							style={{ transitionDelay: "0.4s" }}
						>
							<h3 className="text-white font-bold text-lg mb-4">Compañía</h3>
							<ul className="space-y-2">
								<li>
									<Link
										href="#"
										className="hover:text-white transition"
									>
										Términos
									</Link>
								</li>
								<li>
									<Link
										href="#"
										className="hover:text-white transition"
									>
										Privacidad
									</Link>
								</li>
								<li>
									<Link
										href="#"
										className="hover:text-white transition"
									>
										Contacto
									</Link>
								</li>
							</ul>
						</div>
					</div>

					<div
						className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center animate-in"
						style={{ transitionDelay: "0.5s" }}
					>
						<p className="text-gray-500 mb-4 md:mb-0">
							© 2025 GymCore. Todos los derechos reservados.
						</p>
						<div className="flex space-x-6">
							<Link
								href="#"
								className="text-gray-500 hover:text-white transition"
							>
								Términos
							</Link>
							<Link
								href="#"
								className="text-gray-500 hover:text-white transition"
							>
								Privacidad
							</Link>
							<Link
								href="#"
								className="text-gray-500 hover:text-white transition"
							>
								Cookies
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
