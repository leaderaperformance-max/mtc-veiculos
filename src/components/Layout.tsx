import { Link, Outlet, useLocation } from "react-router-dom";
import logoMtc from "../imgs/logo-mtc.jpg";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Car, Heart, Scale, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";
import { useCompare } from "../contexts/CompareContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { usePageView } from "../lib/usePageView";

interface StoreSettings {
  store_name: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram_url: string;
  facebook_url: string;
  cnpj: string;
}

export function Layout() {
  const { compareList } = useCompare();
  const { favoriteList } = useFavorites();
  usePageView();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
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

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('store_settings').select('*').limit(1).single();
      if (data) setSettings(data);
    }
    loadSettings();
  }, []);

  const navLinks = [
    { name: "Estoque", path: "/estoque" },
    { name: "Financiamento", path: "/financiamento" },
    { name: "Sobre", path: "/sobre" },
    { name: "Contato", path: "/contato" },
  ];

  // Formata o número do whatsapp para a URL
  const whatsappUrl = settings?.whatsapp 
    ? `https://wa.me/55${settings.whatsapp.replace(/\\D/g, '')}` 
    : 'https://wa.me/5511999999999';

  const storeName = settings?.store_name || "PremiumMotors";

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
            <Link to="/" className="flex items-center gap-3">
              <img src={logoMtc} alt="MTC Veículos" className="h-10 w-auto rounded-md" />
              <span className="text-xl font-bold tracking-tight text-gray-900">
                MTC <span className="text-brand">Veículos</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm font-medium text-gray-800 hover:text-brand transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/comparar" className="relative p-2 text-gray-600 hover:text-black transition-colors" title="Comparar">
                <Scale className="w-5 h-5" />
                {compareList.length > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-brand text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {compareList.length}
                  </span>
                )}
              </Link>
              <Link to="/favoritos" className="relative p-2 text-gray-600 hover:text-black transition-colors" title="Favoritos">
                <Heart className="w-5 h-5" />
                {favoriteList.length > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {favoriteList.length}
                  </span>
                )}
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
                <Link to="/comparar" className="flex items-center text-gray-600 relative">
                  <Scale className="w-6 h-6 mr-2" /> Comparar
                  {compareList.length > 0 && (
                    <span className="absolute top-0 left-4 bg-brand text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {compareList.length}
                    </span>
                  )}
                </Link>
                <Link to="/favoritos" className="flex items-center text-gray-600">
                  <Heart className="w-6 h-6 mr-2" /> Favoritos
                </Link>
              </div>
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
              <img src={logoMtc} alt="MTC Veículos" className="h-10 w-auto rounded-md mb-4" />
              <p className="text-gray-400">A melhor experiência na compra do seu próximo veículo.</p>
              {settings?.cnpj && (
                <p className="text-gray-500 text-xs mt-4">CNPJ: {settings.cnpj}</p>
              )}
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
                {settings?.whatsapp && <li>{settings.whatsapp}</li>}
                {settings?.email && <li>{settings.email}</li>}
                {settings?.address && <li className="leading-relaxed">{settings.address}</li>}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Horário</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Seg a Sex: 09h às 19h</li>
                <li>Sáb: 09h às 14h</li>
              </ul>
              
              {(settings?.instagram_url || settings?.facebook_url) && (
                <div className="mt-6">
                  <h4 className="font-medium mb-4">Redes Sociais</h4>
                  <div className="flex space-x-4">
                    {settings.instagram_url && (
                      <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
                    )}
                    {settings.facebook_url && (
                      <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs">
            <p>&copy; {new Date().getFullYear()} {storeName}. Todos os direitos reservados.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="#" className="hover:text-white">Política de Privacidade</Link>
              <Link to="#" className="hover:text-white">Termos de Uso</Link>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Floating WhatsApp Button */}
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-105 transition-transform z-50 flex items-center justify-center"
        title="Fale conosco no WhatsApp"
      >
        <Phone className="w-6 h-6" />
      </a>
    </div>
  );
}
