import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { storeConfig } from "../data/mock";

export function Financiamento() {
  const [vehiclePrice, setVehiclePrice] = useState<number>(100000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [installments, setInstallments] = useState<number>(48);

  const calculateFinancing = useCallback(() => {
    const downPayment = vehiclePrice * (downPaymentPercent / 100);
    const pv = vehiclePrice - downPayment;
    const i = storeConfig.financing_rate / 100;
    const n = installments;

    // PMT = PV * [i * (1 + i)^n] / [(1 + i)^n - 1]
    const pmt = pv * ((i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1));
    const totalPaid = downPayment + (pmt * n);

    return {
      downPayment,
      financedAmount: pv,
      monthlyPayment: pmt,
      totalPaid
    };
  }, [vehiclePrice, downPaymentPercent, installments]);

  const result = calculateFinancing();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">Simulador de Financiamento</h1>
        <p className="text-xl text-gray-500 font-light">
          Descubra as parcelas do seu próximo carro com as melhores taxas do mercado.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Inputs */}
          <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor do Veículo (R$)</label>
                <input 
                  type="number" 
                  value={vehiclePrice}
                  onChange={(e) => setVehiclePrice(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand text-lg font-medium"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Entrada ({downPaymentPercent}%)</label>
                  <span className="text-sm font-medium text-brand">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.downPayment)}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="90" 
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full accent-[#017973]" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parcelas</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[12, 24, 36, 48, 60].map(n => (
                    <button
                      key={n}
                      onClick={() => setInstallments(n)}
                      className={`py-2 rounded-lg font-medium text-sm transition-colors ${installments === n ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {n}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="p-8 md:p-12 bg-gray-50 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="text-sm text-gray-500 font-medium mb-2">Valor da Parcela</div>
              <div className="text-5xl font-bold text-brand">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.monthlyPayment)}
              </div>
              <div className="text-sm text-gray-500 mt-2">em {installments}x com taxa de {storeConfig.financing_rate}% a.m.</div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Valor Financiado</span>
                <span className="font-medium text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.financedAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total a Pagar (Final)</span>
                <span className="font-medium text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.totalPaid)}</span>
              </div>
            </div>

            <button className="w-full bg-[#25D366] text-white py-4 rounded-xl font-medium hover:bg-[#20bd5a] transition-colors">
              Enviar Simulação via WhatsApp
            </button>
            <p className="text-xs text-gray-400 text-center mt-4">
              * Simulação estimada. Condições sujeitas a análise de crédito e aprovação da instituição financeira.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
