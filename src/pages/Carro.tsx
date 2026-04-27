import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { vehicles, storeConfig } from "../data/mock";
import { ChevronLeft, CheckCircle2, Info, MessageCircle, Scale, Heart } from "lucide-react";
import { useState } from "react";

export function Carro() {
  const { slug } = useParams();
  const vehicle = vehicles.find(v => v.slug === slug);
  const [activeImage, setActiveImage] = useState(0);

  if (!vehicle) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Veículo não encontrado</h2>
        <Link to="/estoque" className="text-blue-600 hover:underline">Voltar para o estoque</Link>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(`Olá! Tenho interesse no ${vehicle.brand} ${vehicle.model} ${vehicle.year_model} — R$ ${vehicle.price}. Vi no site.`);

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100">
            <img 
              src={vehicle.images[activeImage]} 
              alt={`${vehicle.brand} ${vehicle.model}`} 
              className="w-full h-full object-cover"
            />
          </div>
          {vehicle.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {vehicle.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-blue-600' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm text-gray-500 font-medium mb-1">{vehicle.brand}</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{vehicle.model}</h1>
              <p className="text-xl text-gray-500 font-light">{vehicle.version}</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
                <Scale className="w-5 h-5" />
              </button>
              <button className="p-3 bg-gray-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors text-gray-600">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="text-4xl font-bold text-gray-900 mb-8">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price)}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {vehicle.highlights.map((h, i) => (
              <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1" /> {h}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-12">
            <div>
              <div className="text-sm text-gray-500 mb-1">Ano</div>
              <div className="font-medium">{vehicle.year_fab}/{vehicle.year_model}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Quilometragem</div>
              <div className="font-medium">{vehicle.mileage.toLocaleString('pt-BR')} km</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Câmbio</div>
              <div className="font-medium">{vehicle.transmission}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Combustível</div>
              <div className="font-medium">{vehicle.fuel}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Cor</div>
              <div className="font-medium">{vehicle.color}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Carroceria</div>
              <div className="font-medium">{vehicle.body_type}</div>
            </div>
          </div>

          <div className="space-y-4">
            <a 
              href={`https://wa.me/${storeConfig.whatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-medium text-lg flex items-center justify-center hover:bg-[#20bd5a] transition-colors"
            >
              <MessageCircle className="w-6 h-6 mr-2" />
              Tenho interesse
            </a>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-black text-white py-4 rounded-2xl font-medium hover:bg-gray-800 transition-colors">
                Simular Financiamento
              </button>
              <button className="bg-gray-100 text-black py-4 rounded-2xl font-medium hover:bg-gray-200 transition-colors">
                Oferecer na troca
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Options */}
      <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Sobre o veículo</h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-12">
            {vehicle.description}
          </p>

          <h2 className="text-2xl font-bold mb-6">Opcionais</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {vehicle.optional_items.map((item, i) => (
              <div key={i} className="flex items-center text-gray-700">
                <div className="w-2 h-2 rounded-full bg-blue-600 mr-3" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-gray-50 p-8 rounded-3xl">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-600" />
              Informações FIPE
            </h3>
            <div className="text-sm text-gray-500 mb-2">Preço médio do mercado</div>
            <div className="text-2xl font-bold text-gray-900 mb-4">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.fipe_price)}
            </div>
            {vehicle.price < vehicle.fipe_price && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm font-medium inline-block">
                Abaixo da FIPE
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
