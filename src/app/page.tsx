'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X, Check, Shield, Clock, Award, Users, Phone, Mail, MapPin } from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/logo.jpg" alt="Dentales Liberato" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-gray-800">Dentales Liberato</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className="text-gray-600 hover:text-blue-600 transition-colors">Inicio</a>
              <a href="#servicios" className="text-gray-600 hover:text-blue-600 transition-colors">Servicios</a>
              <a href="#nosotros" className="text-gray-600 hover:text-blue-600 transition-colors">Nosotros</a>
              <a href="#beneficios" className="text-gray-600 hover:text-blue-600 transition-colors">Beneficios</a>
              <a href="#contacto" className="text-gray-600 hover:text-blue-600 transition-colors">Contacto</a>
              <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Iniciar Sesión
              </Link>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#inicio" className="block text-gray-600 hover:text-blue-600">Inicio</a>
              <a href="#servicios" className="block text-gray-600 hover:text-blue-600">Servicios</a>
              <a href="#nosotros" className="block text-gray-600 hover:text-blue-600">Nosotros</a>
              <a href="#beneficios" className="block text-gray-600 hover:text-blue-600">Beneficios</a>
              <a href="#contacto" className="block text-gray-600 hover:text-blue-600">Contacto</a>
              <Link href="/login" className="block bg-blue-600 text-white px-6 py-2 rounded-lg text-center">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Laboratorio Dental
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                  Profesional
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Transformamos sonrisas con tecnología de vanguardia y precisión artesanal. 
                Sistema integral de gestión para laboratorios dentales modernos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold text-center shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40">
                  Acceder al Sistema
                </Link>
                <a href="#contacto" className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-all font-semibold text-center">
                  Contactar
                </a>
              </div>
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">15+</div>
                  <div className="text-sm text-gray-500">Años de experiencia</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">5000+</div>
                  <div className="text-sm text-gray-500">Casos completados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">98%</div>
                  <div className="text-sm text-gray-500">Satisfacción</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center p-1">
                      <img src="/logo.jpg" alt="Dentales Liberato" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Sistema ERP Integral</div>
                      <div className="text-sm text-gray-500">Gestión completa</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">Inventario inteligente</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">Control financiero</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">Gestión de casos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-600">Reportes en tiempo real</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Soluciones integrales para laboratorios dentales de alto nivel
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Prótesis Dentales</h3>
              <p className="text-gray-600">
                Coronas, puentes y prótesis removibles con materiales de la más alta calidad y precisión milimétrica.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ortodoncia</h3>
              <p className="text-gray-600">
                Brackets, alineadores y aparatos ortodónticos personalizados para cada paciente.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-xl transition-all group">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Estética Dental</h3>
              <p className="text-gray-600">
                Carillas, facetas y blanqueamiento para sonrisas perfectas y naturales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Sobre Nosotros
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Dentales Liberato es un laboratorio dental líder con más de 15 años de experiencia 
                en la fabricación de prótesis y aparatos dentales de alta precisión.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Combinamos tecnología de vanguardia con la artesanía tradicional para ofrecer 
                resultados excepcionales que superan las expectativas de nuestros clientes.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <span className="text-gray-700">Equipo experto</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <span className="text-gray-700">Certificación ISO</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Nuestra Misión</h3>
              <p className="text-blue-100 mb-6 leading-relaxed">
                Proporcionar soluciones prostodónticas de la más alta calidad, 
                mejorando la calidad de vida de nuestros pacientes a través de 
                innovación constante y excelencia en cada detalle.
              </p>
              <h3 className="text-2xl font-bold mb-4">Nuestra Visión</h3>
              <p className="text-blue-100 leading-relaxed">
                Ser el laboratorio dental de referencia en Colombia, reconocidos 
                por nuestra precisión, calidad y compromiso con la excelencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Beneficios de Nuestro Sistema
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tecnología avanzada para optimizar cada aspecto de su laboratorio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:scale-105 transition-transform">
              <Shield className="w-10 h-10 mb-4" />
              <h3 className="font-bold text-lg mb-2">Inventario Inteligente</h3>
              <p className="text-blue-100 text-sm">
                Control automático de stock con múltiples unidades de medida
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white hover:scale-105 transition-transform">
              <Clock className="w-10 h-10 mb-4" />
              <h3 className="font-bold text-lg mb-2">Gestión de Casos</h3>
              <p className="text-indigo-100 text-sm">
                Seguimiento completo de cada trabajo dental
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:scale-105 transition-transform">
              <Award className="w-10 h-10 mb-4" />
              <h3 className="font-bold text-lg mb-2">Control Financiero</h3>
              <p className="text-purple-100 text-sm">
                Integración total de costos, ingresos y cuentas por cobrar
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white hover:scale-105 transition-transform">
              <Users className="w-10 h-10 mb-4" />
              <h3 className="font-bold text-lg mb-2">Reportes Avanzados</h3>
              <p className="text-pink-100 text-sm">
                Análisis detallado de ganancias y rendimiento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Contáctenos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Estamos listos para atender sus requerimientos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Teléfono</h3>
              <p className="text-gray-600">+57 300 123 4567</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">info@dentalesliberato.com</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Ubicación</h3>
              <p className="text-gray-600">Bogotá, Colombia</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Su nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="su@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="¿Cómo podemos ayudarle?"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo.jpg" alt="Dentales Liberato" className="w-10 h-10 object-contain" />
                <span className="text-xl font-bold">Dentales Liberato</span>
              </div>
              <p className="text-gray-400 text-sm">
                Laboratorio dental profesional con tecnología de vanguardia.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Servicios</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Prótesis Dentales</li>
                <li>Ortodoncia</li>
                <li>Estética Dental</li>
                <li>Implantes</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#inicio" className="hover:text-white">Inicio</a></li>
                <li><a href="#servicios" className="hover:text-white">Servicios</a></li>
                <li><a href="#nosotros" className="hover:text-white">Nosotros</a></li>
                <li><a href="#contacto" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>+57 300 123 4567</li>
                <li>info@dentalesliberato.com</li>
                <li>Bogotá, Colombia</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Dentales Liberato. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
