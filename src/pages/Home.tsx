import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Search, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { VehicleImageSlider } from "../components/VehicleImageSlider";

export function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredVehicles, setFeaturedVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Início | Minha Loja de Veículos';
  }, []);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const { data } = await supabase
          .from('vehicles')
          .select(`
            id,
            brand,
            model,
            year,
            price,
            mileage,
            transmission,
            created_at,
            vehicle_images (
              url, is_primary
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (data) {
          const processedVehicles = data.map(v => {
            const imgs = (v.vehicle_images ?? []) as { url: string; is_primary: boolean }[];
            const sorted = [...imgs].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
            return { ...v, images: sorted.map(i => i.url), is_new_arrival: false };
          });
          setFeaturedVehicles(processedVehicles);
        }
      } catch (error) {
        console.error('Erro ao carregar destaques:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadFeatured();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/estoque?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/estoque');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Car" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-7xl font-bold text-white tracking-tight mb-6"
          >
            O seu próximo carro está aqui.
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-xl md:text-2xl text-gray-300 mb-8 font-light"
          >
            Qualidade, procedência e as melhores condições de financiamento.
          </motion.p>

          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSearch}
            className="bg-white/10 backdrop-blur-xl p-2 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center max-w-2xl mx-auto border border-white/20 gap-2 sm:gap-0"
          >
            <div className="flex items-center flex-1 px-2">
              <Search className="w-5 h-5 text-white/70 ml-2 shrink-0" />
              <input
                type="text"
                placeholder="Busque por marca, modelo ou ano..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white px-3 py-3 w-full placeholder:text-white/50 text-base"
              />
            </div>
            <button
              type="submit"
              className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors shrink-0"
            >
              Buscar
            </button>
          </motion.form>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Destaques</h2>
            <p className="text-xl text-gray-500 font-light">Os veículos mais recentes do nosso estoque.</p>
          </div>
          <Link to="/estoque" className="hidden md:flex items-center text-brand font-medium hover:text-brand-dark">
            Ver todo o estoque <ChevronRight className="w-5 h-5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : featuredVehicles.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum veículo em destaque</h3>
            <p className="text-gray-500">O estoque está vazio no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVehicles.map((vehicle, index) => (
              <motion.div 
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-black/[0.04]"
              >
                <Link to={`/carro/${vehicle.id}`}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <VehicleImageSlider
                      images={vehicle.images}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                    />
                    {vehicle.is_new_arrival && (
                      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Novo
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-500 font-medium mb-1">{vehicle.brand}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{vehicle.model}</h3>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                      <span>{vehicle.year}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{vehicle.mileage != null ? vehicle.mileage.toLocaleString('pt-BR') + ' km' : '-'}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{vehicle.transmission}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price)}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center md:hidden">
          <Link to="/estoque" className="inline-flex items-center text-brand font-medium hover:text-brand-dark">
            Ver todo o estoque <ChevronRight className="w-5 h-5 ml-1" />
          </Link>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-16">Por que escolher a nossa loja?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Procedência Garantida", desc: "Todos os veículos passam por um rigoroso laudo cautelar e revisão completa." },
              { title: "Financiamento Facilitado", desc: "Trabalhamos com os melhores bancos e taxas do mercado para o seu perfil." },
              { title: "Avaliação Justa", desc: "Seu usado vale mais na troca. Avaliação transparente, rápida e segura." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-light text-brand flex items-center justify-center mb-6 text-2xl font-bold">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed max-w-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
