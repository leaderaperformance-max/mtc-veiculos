import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Plus, Scale, Loader2, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useCompare } from "../contexts/CompareContext";

const SPECS = [
  { label: "Preço", key: "price", format: (v: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v) },
  { label: "Ano", key: "year" },
  { label: "Quilometragem", key: "mileage", format: (v: any) => v != null ? `${v.toLocaleString("pt-BR")} km` : "-" },
  { label: "Câmbio", key: "transmission" },
  { label: "Cor", key: "color" },
];

export function Comparar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Comparar Veículos | Minha Loja de Veículos';
  }, []);

  useEffect(() => {
    if (compareList.length === 0) {
      setVehicles([]);
      return;
    }

    async function fetchVehicles() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("vehicles")
          .select(`id, brand, model, year, price, mileage, transmission, color, vehicle_images(url)`)
          .in("id", compareList);

        if (data) {
          const processed = data.map((v) => {
            const imageUrl =
              v.vehicle_images && v.vehicle_images.length > 0
                ? v.vehicle_images[0].url
                : "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800";
            return { ...v, image: imageUrl };
          });
          // preserve original compare order
          const ordered = compareList.map((id) => processed.find((v) => v.id === id)).filter(Boolean);
          setVehicles(ordered);
        }
      } catch (err) {
        console.error("Erro ao buscar veículos para comparação:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
  }, [compareList]);

  const isEmpty = compareList.length === 0;
  const canAddMore = compareList.length < 4;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-1">Comparar Veículos</h1>
          <p className="text-gray-500 font-light">
            {isEmpty ? "Nenhum veículo selecionado" : `${vehicles.length} veículo${vehicles.length > 1 ? "s" : ""} em comparação`}
          </p>
        </div>
        {!isEmpty && (
          <button
            onClick={clearCompare}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors border border-gray-200 rounded-xl px-4 py-2 hover:border-red-200 bg-white"
          >
            <X className="w-4 h-4" />
            Limpar comparação
          </button>
        )}
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center mb-6">
            <Scale className="w-8 h-8 text-brand" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum veículo para comparar</h2>
          <p className="text-gray-500 mb-8 max-w-sm">
            Navegue pelo estoque e clique no ícone <Scale className="inline w-4 h-4 mx-1" /> para adicionar veículos à comparação.
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

      {/* Comparison table */}
      {!loading && !isEmpty && vehicles.length > 0 && (
        <div className="overflow-x-auto -mx-4 px-4">
          <div style={{ minWidth: `${Math.max(340, vehicles.length * 160 + 120)}px` }}>

            {/* Vehicle cards header row */}
            <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `120px repeat(${vehicles.length + (canAddMore ? 1 : 0)}, 1fr)` }}>
              <div /> {/* empty label column */}

              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                  <button
                    onClick={() => removeFromCompare(vehicle.id)}
                    className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                    title="Remover"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={vehicle.image}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-gray-400 font-medium mb-0.5">{vehicle.brand}</div>
                    <div className="font-bold text-gray-900 leading-tight">{vehicle.model}</div>
                    <div className="text-sm text-gray-500 mt-0.5 truncate">{vehicle.version}</div>
                    <Link
                      to={`/carro/${vehicle.id}`}
                      className="mt-3 text-xs text-brand hover:underline inline-flex items-center gap-1"
                    >
                      Ver detalhes <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}

              {/* Add more slot */}
              {canAddMore && (
                <Link
                  to="/estoque"
                  className="flex flex-col items-center justify-center gap-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl hover:border-brand hover:bg-brand-light/40 transition-colors min-h-[220px] text-gray-400 hover:text-brand"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">Adicionar veículo</span>
                </Link>
              )}
            </div>

            {/* Specs rows */}
            <div className="space-y-2">
              {SPECS.map((spec, i) => (
                <div
                  key={spec.key}
                  className={`grid gap-4 items-center rounded-2xl px-0 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                  style={{ gridTemplateColumns: `120px repeat(${vehicles.length + (canAddMore ? 1 : 0)}, 1fr)` }}
                >
                  {/* Label */}
                  <div className="px-4 py-3 text-sm font-medium text-gray-500">{spec.label}</div>

                  {/* Values */}
                  {vehicles.map((vehicle, vi) => {
                    const raw = vehicle[spec.key];
                    const value = raw !== null && raw !== undefined
                      ? (spec.format ? spec.format(raw) : String(raw))
                      : "—";

                    // Highlight lowest price
                    const isPrice = spec.key === "price";
                    const prices = vehicles.map((v) => v.price);
                    const minPrice = Math.min(...prices);
                    const isLowest = isPrice && vehicle.price === minPrice && vehicles.length > 1;

                    return (
                      <div key={vi} className={`px-4 py-3 text-sm font-semibold ${isLowest ? "text-green-600" : "text-gray-900"}`}>
                        {value}
                        {isLowest && <span className="ml-1 text-xs font-normal text-green-500">menor preço</span>}
                      </div>
                    );
                  })}

                  {/* Empty add slot column */}
                  {canAddMore && <div />}
                </div>
              ))}
            </div>

            {/* CTA row */}
            <div
              className="grid gap-4 mt-6"
              style={{ gridTemplateColumns: `120px repeat(${vehicles.length + (canAddMore ? 1 : 0)}, 1fr)` }}
            >
              <div />
              {vehicles.map((vehicle) => (
                <Link
                  key={vehicle.id}
                  to={`/carro/${vehicle.id}`}
                  className="bg-black text-white text-sm font-medium py-3 rounded-xl text-center hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                >
                  Ver veículo <ChevronRight className="w-4 h-4" />
                </Link>
              ))}
              {canAddMore && <div />}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
