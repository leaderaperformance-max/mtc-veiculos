import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Car, Heart, Scale, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";

export function Layout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navLinks = [
    { name: "Estoque", path: "/estoque" },
    { name: "Financiamento", path: "/financiamento" },
    { name: "Sobre", path: "/sobre" },
    { name: "Contato", path: "/contato" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd]">
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
          isScrolled
            ? "bg-white/80 backdrop-blur-md border-b border-black/5 py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-semibold tracking-tight">
              Premium<span className="text-blue-600">Motors</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/comparar" className="p-2 text-gray-600 hover:text-black transition-colors" title="Comparar">
                <Scale className="w-5 h-5" />
              </Link>
              <Link to="/favoritos" className="p-2 text-gray-600 hover:text-black transition-colors" title="Favoritos">
                <Heart className="w-5 h-5" />
              </Link>
              <Link to="/admin/dashboard" className="text-xs font-medium text-gray-400 hover:text-gray-800 transition-colors">
                Admin
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col space-y-6 text-xl font-medium">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className="border-b border-gray-100 pb-4">
                  {link.name}
                </Link>
              ))}
              <div className="flex space-x-6 pt-4">
                <Link to="/comparar" className="flex items-center text-gray-600">
                  <Scale className="w-6 h-6 mr-2" /> Comparar
                </Link>
                <Link to="/favoritos" className="flex items-center text-gray-600">
                  <Heart className="w-6 h-6 mr-2" /> Favoritos
                </Link>
              </div>
              <Link to="/admin/dashboard" className="text-sm font-medium text-gray-400 pt-8">
                Acesso Restrito (Admin)
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>

      <footer className="bg-[#1d1d1f] text-[#f5f5f7] py-12 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-gray-800 pb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">PremiumMotors</h3>
              <p className="text-gray-400">A melhor experiência na compra do seu próximo veículo.</p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/estoque" className="hover:text-white transition-colors">Estoque</Link></li>
                <li><Link to="/financiamento" className="hover:text-white transition-colors">Financiamento</Link></li>
                <li><Link to="/sobre" className="hover:text-white transition-colors">Sobre Nós</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400">
                <li>(11) 3333-4444</li>
                <li>contato@premiummotors.com.br</li>
                <li>Av. das Nações Unidas, 12345</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Horário</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Seg a Sex: 09h às 19h</li>
                <li>Sáb: 09h às 14h</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs">
            <p>&copy; {new Date().getFullYear()} PremiumMotors. Todos os direitos reservados.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="#" className="hover:text-white">Política de Privacidade</Link>
              <Link to="#" className="hover:text-white">Termos de Uso</Link>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/5511999999999" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform z-50 flex items-center justify-center"
      >
        <Phone className="w-6 h-6" />
      </a>
    </div>
  );
}
