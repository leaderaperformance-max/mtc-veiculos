import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, ChevronRight, Loader2, X, Scale } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useFavorites } from "../contexts/FavoritesContext";
import { useCompare } from "../contexts/CompareContext";
import { VehicleImageSlider } from "../components/VehicleImageSlider";

export function Favoritos() {
  const { favoriteList, toggleFavorite, clearFavorites } = useFavorites();
  const { isComparing, addToCompare, removeFromCompare } = useCompare();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Favoritos | MTC Veículos';
  }, []);

  useEffect(() => {
    if (favoriteList.length === 0) {
      setVehicles([]);
      return;
    }

    async function fetchVehicles() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("vehicles")
          .select(`id, brand, model, year, price, mileage, transmission, vehicle_images(url, is_primary)`)
          .in("id", favoriteList);

        if (data) {
          const processed = data.map((v) => {
            const imgs = (v.vehicle_images ?? []) as { url: string; is_primary: boolean }[];
            const sorted = [...imgs].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
            return { ...v, images: sorted.map(i => i.url) };
          });
          const ordered = favoriteList.map((id) => processed.find((v) => v.id === id)).filter(Boolean);
          setVehicles(ordered);
        }
      } catch (err) {
        console.error("Erro ao buscar favoritos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, [favoriteList]);

  const isEmpty = favoriteList.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Favoritos</h1>
          <p className="text-xl text-gray-500 font-light">
            {isEmpty ? "Nenhum favorito salvo" : `${vehicles.length} veículo${vehicles.length > 1 ? "s" : ""} salvos`}
          </p>
        </div>
        {!isEmpty && (
          <button
            onClick={clearFavorites}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors border border-gray-200 rounded-xl px-4 py-2 hover:border-red-200 bg-white"
          >
            <X className="w-4 h-4" />
            Limpar favoritos
          </button>
        )}
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
            <Heart className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum favorito ainda</h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            Navegue pelo estoque e clique no <Heart className="inline w-4 h-4 mx-1 text-red-400" /> para salvar veículos que você gostou.
          </p>
          <Link
            to="/estoque"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Ver estoque <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Loading */}
      {loading && !isEmpty && (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-brand" />
        </div>
      )}

      {/* Grid */}
      {!loading && !isEmpty && vehicles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className="group bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 border border-black/[0.04]"
            >
              <Link to={`/carro/${vehicle.id}`}>
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <VehicleImageSlider
                    images={vehicle.images}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                  />
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-500 font-medium mb-1">{vehicle.brand}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{vehicle.model}</h3>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md">{vehicle.year}</span>
                    <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md">{vehicle.mileage != null ? vehicle.mileage.toLocaleString("pt-BR") + " km" : "-"}</span>
                    <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md">{vehicle.transmission}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(vehicle.price)}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          isComparing(vehicle.id) ? removeFromCompare(vehicle.id) : addToCompare(vehicle.id);
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isComparing(vehicle.id)
                            ? "bg-brand text-white"
                            : "bg-gray-50 text-gray-400 hover:text-brand"
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
                        className="w-10 h-10 rounded-full bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors"
                        title="Remover dos favoritos"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
