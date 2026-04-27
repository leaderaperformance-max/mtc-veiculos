import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { vehicles } from "../data/mock";
import { ChevronRight, Filter, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export function Estoque() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredVehicles = vehicles.filter(v => {
    if (!query) return true;
    return v.brand.toLowerCase().includes(query) || 
           v.model.toLowerCase().includes(query) || 
           v.year_model.toString().includes(query);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Estoque</h1>
          <p className="text-xl text-gray-500 font-light">
            {filteredVehicles.length} veículos encontrados
            {query && <span> para "{query}"</span>}
          </p>
        </div>
        
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filtros</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar (Mobile Hidden by default) */}
        <div className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <Filter className="w-5 h-5 mr-2" /> Filtrar por
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Todas as marcas</option>
                  <option value="toyota">Toyota</option>
                  <option value="honda">Honda</option>
                  <option value="jeep">Jeep</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preço Máximo</label>
                <input type="range" min="50000" max="300000" step="10000" className="w-full accent-blue-600" />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>R$ 50k</span>
                  <span>R$ 300k+</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ano Mínimo</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Qualquer ano</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>
              
              <button className="w-full bg-black text-white rounded-xl py-3 font-medium hover:bg-gray-800 transition-colors">
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="lg:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVehicles.map((vehicle, index) => (
              <motion.div 
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <Link to={`/carro/${vehicle.slug}`}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img 
                      src={vehicle.images[0]} 
                      alt={`${vehicle.brand} ${vehicle.model}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {vehicle.is_offer && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Oferta
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-500 font-medium mb-1">{vehicle.brand}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{vehicle.model} <span className="font-normal text-gray-500">{vehicle.version}</span></h3>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md">{vehicle.year_model}</span>
                      <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md">{vehicle.mileage.toLocaleString('pt-BR')} km</span>
                      <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md">{vehicle.transmission}</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-2xl font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price)}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          {filteredVehicles.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum veículo encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros da sua busca.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
