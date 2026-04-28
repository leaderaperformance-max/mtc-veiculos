import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle2, MessageCircle, Scale, Heart, Loader2, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useCompare } from "../contexts/CompareContext";
import { useFavorites } from "../contexts/FavoritesContext";

export function Carro() {
  const { isComparing, addToCompare, removeFromCompare } = useCompare();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { slug } = useParams(); // na verdade é o ID do veículo
  const [vehicle, setVehicle] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  // Galeria fullscreen
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  // Calculadora de financiamento
  const [entryPercent, setEntryPercent] = useState(20);
  const [months, setMonths] = useState(36);

  // Estados do formulário de Lead
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [isSendingLead, setIsSendingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  useEffect(() => {
    async function fetchVehicle() {
      try {
        // Busca Configurações (WhatsApp)
        const { data: storeData } = await supabase.from('store_settings').select('whatsapp').single();
        if (storeData) setSettings(storeData);

        // Busca o Veículo
        const { data: vData, error } = await supabase
          .from('vehicles')
          .select(`
            id, brand, model, year, price, mileage, transmission, color, description, fuel_type,
            vehicle_images (
              url
            )
          `)
          .eq('id', slug)
          .single();

        if (error) throw error;

        if (vData) {
          setVehicle(vData);
          // Processa imagens
          if (vData.vehicle_images && vData.vehicle_images.length > 0) {
            const urls = vData.vehicle_images.map((img: any) => img.url);
            setImages(urls);
          } else {
            setImages(['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800']);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do carro:", err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchVehicle();
  }, [slug]);

  // Fechar fullscreen com Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setFullscreenOpen(false);
      if (e.key === 'ArrowRight' && fullscreenOpen) setActiveImage(prev => (prev + 1) % images.length);
      if (e.key === 'ArrowLeft' && fullscreenOpen) setActiveImage(prev => (prev - 1 + images.length) % images.length);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenOpen, images.length]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingLead(true);
    try {
      const { error } = await supabase.from('leads').insert({
        name: leadName,
        phone: leadPhone,
        email: leadEmail,
        vehicle_id: vehicle.id,
        message: `Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        status: 'novo'
      });
      if (error) throw error;

      // Envia para webhook
      fetch('https://editor.leaderaperformance.com.br/webhook/mtc-veiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: leadName,
          whatsapp: leadPhone,
          email: leadEmail,
          veiculo: `${vehicle.brand} ${vehicle.model}`,
          ano: vehicle.year,
          preco: vehicle.price,
          vehicle_id: vehicle.id,
          origem: 'site - página do veículo',
        }),
      }).catch(() => {}); // silencia erro de rede no webhook

      setLeadSuccess(true);
      setLeadName('');
      setLeadPhone('');
      setLeadEmail('');
    } catch (err) {
      console.error("Erro ao enviar contato:", err);
      alert('Houve um erro ao enviar seu contato. Tente novamente ou use o WhatsApp.');
    } finally {
      setIsSendingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Veículo não encontrado</h2>
        <Link to="/estoque" className="text-brand hover:underline">Voltar para o estoque</Link>
      </div>
    );
  }

  // Cálculos de financiamento
  const entryValue = vehicle.price * (entryPercent / 100);
  const financedValue = vehicle.price - entryValue;
  const monthlyRate = 1.99 / 100;
  const installment = financedValue > 0 && months > 0
    ? financedValue * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    : 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const whatsappMessage = encodeURIComponent(`Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year} — R$ ${vehicle.price}. Vi no site.`);
  const whatsappUrl = settings?.whatsapp
    ? `https://wa.me/55${settings.whatsapp.replace(/\\D/g, '')}?text=${whatsappMessage}`
    : `https://wa.me/5511999999999?text=${whatsappMessage}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <Link to="/estoque" className="inline-flex items-center text-gray-500 hover:text-black mb-8 transition-colors">
        <ChevronLeft className="w-5 h-5 mr-1" /> Voltar para o estoque
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div
            className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-black/[0.04] cursor-zoom-in"
            onClick={() => setFullscreenOpen(true)}
          >
            <img
              src={images[activeImage]}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="pt-2">
            <h2 className="text-xl font-bold mb-3 text-gray-900">Sobre o veículo</h2>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {vehicle.description || "Nenhuma descrição detalhada fornecida para este veículo."}
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm text-gray-500 font-medium mb-1">{vehicle.brand}</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{vehicle.model}</h1>
              {vehicle.fuel_type && <p className="text-xl text-gray-500 font-light">{vehicle.fuel_type}</p>}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => isComparing(vehicle.id) ? removeFromCompare(vehicle.id) : addToCompare(vehicle.id)}
                className={`p-3 rounded-full transition-colors ${
                  isComparing(vehicle.id)
                    ? 'bg-brand text-white hover:bg-brand-dark'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                title={isComparing(vehicle.id) ? "Remover da comparação" : "Adicionar à comparação"}
              >
                <Scale className="w-5 h-5" />
              </button>
              <button
                onClick={() => toggleFavorite(vehicle.id)}
                className={`p-3 rounded-full transition-colors ${
                  isFavorite(vehicle.id)
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500"
                }`}
                title={isFavorite(vehicle.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <Heart className={`w-5 h-5 ${isFavorite(vehicle.id) ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          <div className="text-4xl font-bold text-gray-900 mb-8">
            {formatCurrency(vehicle.price)}
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-8">
            <div>
              <div className="text-sm text-gray-500 mb-1">Ano</div>
              <div className="font-medium text-gray-900">{vehicle.year}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Quilometragem</div>
              <div className="font-medium text-gray-900">{vehicle.mileage != null ? vehicle.mileage.toLocaleString('pt-BR') + ' km' : '-'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Câmbio</div>
              <div className="font-medium text-gray-900">{vehicle.transmission}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Cor</div>
              <div className="font-medium text-gray-900">{vehicle.color}</div>
            </div>
            {vehicle.fuel_type && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Combustível</div>
                <div className="font-medium text-gray-900">{vehicle.fuel_type}</div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-sm mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Tem interesse?</h3>
            {leadSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl flex items-start">
                <CheckCircle2 className="w-6 h-6 mr-3 text-green-600 flex-shrink-0" />
                <p>Obrigado! Seu contato foi enviado com sucesso. Em breve um de nossos consultores entrará em contato.</p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Seu nome"
                  required
                  value={leadName}
                  onChange={e => setLeadName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand outline-none"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    placeholder="Seu WhatsApp"
                    required
                    value={leadPhone}
                    onChange={e => setLeadPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand outline-none"
                  />
                  <input
                    type="email"
                    placeholder="E-mail (opcional)"
                    value={leadEmail}
                    onChange={e => setLeadEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSendingLead}
                  className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-70 flex justify-center items-center"
                >
                  {isSendingLead ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Contato'}
                </button>
              </form>
            )}

            <div className="mt-4 text-center">
              <span className="text-gray-500 text-sm">ou</span>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full bg-[#25D366] text-white py-4 rounded-xl font-medium flex items-center justify-center hover:bg-[#20bd5a] transition-colors"
            >
              <MessageCircle className="w-6 h-6 mr-2" />
              Chamar no WhatsApp
            </a>
          </div>

          {/* Calculadora de Financiamento */}
          <div className="bg-gray-50 rounded-3xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-5 text-gray-900">Simule o Financiamento</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Entrada</label>
                <select
                  value={entryPercent}
                  onChange={e => setEntryPercent(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-brand outline-none text-sm"
                >
                  {[0, 10, 20, 30].map(p => (
                    <option key={p} value={p}>{p === 0 ? 'Sem entrada' : `${p}% — ${formatCurrency(vehicle.price * p / 100)}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Prazo</label>
                <select
                  value={months}
                  onChange={e => setMonths(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-brand outline-none text-sm"
                >
                  {[12, 24, 36, 48, 60].map(m => (
                    <option key={m} value={m}>{m}x</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 flex sm:flex-col justify-between sm:justify-start">
                <div className="text-xs text-gray-500 mb-0 sm:mb-1">Entrada</div>
                <div className="font-bold text-gray-900 text-sm">{formatCurrency(entryValue)}</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 flex sm:flex-col justify-between sm:justify-start">
                <div className="text-xs text-gray-500 mb-0 sm:mb-1">Financiado</div>
                <div className="font-bold text-gray-900 text-sm">{formatCurrency(financedValue)}</div>
              </div>
              <div className="bg-brand rounded-2xl p-4 flex sm:flex-col justify-between sm:justify-start">
                <div className="text-xs text-brand-light mb-0 sm:mb-1">{months}x de</div>
                <div className="font-bold text-white text-sm">{formatCurrency(installment)}</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">* Simulação com taxa de 1,99% a.m. Sujeito a análise de crédito.</p>
          </div>
        </div>
      </div>


      {/* Fullscreen Gallery Modal */}
      <AnimatePresence>
        {fullscreenOpen && (
          <motion.div
            key="fullscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setFullscreenOpen(false)}
          >
            {/* Close button */}
            <button
              className="fixed top-4 right-4 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white"
              onClick={e => { e.stopPropagation(); setFullscreenOpen(false); }}
              aria-label="Fechar"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left arrow */}
            {images.length > 1 && (
              <button
                className="fixed left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white"
                onClick={e => { e.stopPropagation(); setActiveImage(prev => (prev - 1 + images.length) % images.length); }}
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={activeImage}
              src={images[activeImage]}
              alt={`${vehicle.brand} ${vehicle.model} — imagem ${activeImage + 1}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />

            {/* Right arrow */}
            {images.length > 1 && (
              <button
                className="fixed right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white"
                onClick={e => { e.stopPropagation(); setActiveImage(prev => (prev + 1) % images.length); }}
                aria-label="Próxima imagem"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/10 text-white text-sm px-4 py-2 rounded-full">
                {activeImage + 1} / {images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
