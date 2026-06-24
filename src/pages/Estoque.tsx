import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useCompare } from "../contexts/CompareContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { Scale, Heart } from "lucide-react";
import { VehicleImageSlider } from "../components/VehicleImageSlider";

export function Estoque() {
  const { isComparing, addToCompare, removeFromCompare } = useCompare();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q")?.toLowerCase() || "";
  
  const [textSearch, setTextSearch] = useState(initialQuery);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos filtros
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [minYear, setMinYear] = useState<string>("");
  const [fuelFilter, setFuelFilter] = useState<string>("");

  useEffect(() => {
    async function fetchVehicles() {
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
            fuel_type,
            created_at,
            vehicle_images (
              url, is_primary
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (data) {
          const processed = data.map(v => {
            const imgs = (v.vehicle_images ?? []) as { url: string; is_primary: boolean }[];
            const sorted = [...imgs].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
            return { ...v, images: sorted.map(i => i.url), is_new_arrival: false };
          });
          setVehicles(processed);
          setFilteredVehicles(processed);
        }
      } catch (error) {
        console.error("Erro ao buscar veículos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, []);

  // Efeito para aplicar filtros
  useEffect(() => {
    let result = vehicles;

    // Filtro de Busca por Texto
    if (textSearch) {
      result = result.filter(v =>
        v.brand.toLowerCase().includes(textSearch.toLowerCase()) ||
        v.model.toLowerCase().includes(textSearch.toLowerCase()) ||
        v.year.toString().includes(textSearch)
      );
    }

    // Filtro de Marca
    if (brandFilter) {
      result = result.filter(v => v.brand.toLowerCase() === brandFilter.toLowerCase());
    }

    // Filtro de Preço
    if (maxPrice < 300000) {
      result = result.filter(v => v.price <= maxPrice);
    }

    // Filtro de Ano Mínimo
    if (minYear) {
      result = result.filter(v => parseInt(v.year) >= parseInt(minYear) || v.year?.includes(minYear));
    }

    // Filtro de Combustível
    if (fuelFilter) {
      result = result.filter(v => v.fuel_type?.toLowerCase() === fuelFilter.toLowerCase());
    }

    setFilteredVehicles(result);
  }, [vehicles, textSearch, brandFilter, maxPrice, minYear, fuelFilter]);

  // SEO - título dinâmico
  useEffect(() => {
    document.title = 'Estoque | MTC Veículos';
  }, []);

  // Extrair marcas únicas para o select
  const uniqueBrands = Array.from(new Set(vehicles.map(v => v.brand))).sort();
  
  // Extrair anos únicos para o select
  const uniqueYears = Array.from(new Set(vehicles.map(v => v.year))).sort((a: string, b: string) => b.localeCompare(a));

  // Extrair combustíveis únicos para o select
  const uniqueFuels = Array.from(new Set(vehicles.map(v => v.fuel_type).filter(Boolean))).sort();

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
            {loading ? "Carregando..." : `${filteredVehicles.length} veículos encontrados`}
            {initialQuery && <span> para "{initialQuery}"</span>}
          </p>
        </div>
        
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 bg-white border border-gray-200 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filtros</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
            <h3 className="text-lg font-bold mb-6 flex items-center text-gray-900">
              <Filter className="w-5 h-5 mr-2" /> Filtrar por
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Busca</label>
                <input
                  type="text"
                  value={textSearch}
                  onChange={e => setTextSearch(e.target.value)}
                  placeholder="Marca, modelo..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                <select 
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand transition-shadow"
                >
                  <option value="">Todas as marcas</option>
                  {uniqueBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preço Máximo: R$ {maxPrice === 300000 ? '300k+' : `${(maxPrice/1000).toFixed(0)}k`}</label>
                <input 
                  type="range" 
                  min="20000" 
                  max="300000" 
                  step="5000" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#017973]" 
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>R$ 20k</span>
                  <span>R$ 300k+</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ano Mínimo</label>
                <select 
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand transition-shadow"
                >
                  <option value="">Qualquer ano</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Combustível</label>
                <select
                  value={fuelFilter}
                  onChange={(e) => setFuelFilter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand transition-shadow"
                >
                  <option value="">Todos</option>
                  {uniqueFuels.map(fuel => (
                    <option key={fuel} value={fuel}>{fuel}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setTextSearch("");
                  setBrandFilter("");
                  setMaxPrice(300000);
                  setMinYear("");
                  setFuelFilter("");
                }}
                className="w-full bg-black text-white rounded-xl py-3 font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="lg:w-3/4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-brand" />
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Nenhum veículo encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros da sua busca.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVehicles.map((vehicle, index) => (
                <motion.div 
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md">{vehicle.year}</span>
                        <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md">{vehicle.mileage != null ? vehicle.mileage.toLocaleString('pt-BR') + ' km' : '-'}</span>
                        <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md">{vehicle.transmission}</span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="text-2xl font-bold text-gray-900">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price)}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              isComparing(vehicle.id) ? removeFromCompare(vehicle.id) : addToCompare(vehicle.id);
                            }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                              isComparing(vehicle.id)
                                ? 'bg-brand text-white'
                                : 'bg-gray-50 text-gray-400 hover:text-brand'
                            }`}
                            title={isComparing(vehicle.id) ? "Remover da comparação" : "Adicionar à comparação"}
                          >
                            <Scale className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFavorite(vehicle.id);
                            }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                              isFavorite(vehicle.id)
                                ? 'bg-red-50 text-red-400'
                                : 'bg-gray-50 text-gray-400 hover:text-red-400'
                            }`}
                            title={isFavorite(vehicle.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                          >
                            <Heart className={`w-4 h-4 ${isFavorite(vehicle.id) ? 'fill-current' : ''}`} />
                          </button>
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
