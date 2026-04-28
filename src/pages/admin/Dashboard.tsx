import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Users, TrendingUp, Bell, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalVehicles: number;
  totalLeads: number;
  totalViews: number;
  newLeads: number;
}

interface RecentLead {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  status: string;
  vehicles: { brand: string; model: string } | null;
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    totalLeads: 0,
    totalViews: 0,
    newLeads: 0,
  });
  const [recentVehicles, setRecentVehicles] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch Total Vehicles
      const { count: vehiclesCount } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });

      // Fetch Total Leads
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      // Fetch Total Views
      const { count: viewsCount } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true });

      // Fetch New Leads (status = 'novo')
      const { count: newLeadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'novo');

      // Fetch Recent Vehicles
      const { data: recent } = await supabase
        .from('vehicles')
        .select('id, brand, model, year, price, color, is_active')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch Recent Leads
      const { data: leads } = await supabase
        .from('leads')
        .select('id, name, phone, created_at, status, vehicles(brand, model)')
        .order('created_at', { ascending: false })
        .limit(3);

      setStats({
        totalVehicles: vehiclesCount || 0,
        totalLeads: leadsCount || 0,
        totalViews: viewsCount || 0,
        newLeads: newLeadsCount || 0,
      });
      setRecentVehicles(recent || []);
      setRecentLeads((leads as unknown as RecentLead[]) || []);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total de Veículos', value: stats.totalVehicles, icon: Car, change: 'Estoque atual', changeType: 'neutral', highlight: false },
    { name: 'Leads Recebidos', value: stats.totalLeads, icon: Users, change: 'Contatos', changeType: 'neutral', highlight: false },
    { name: 'Visualizações', value: stats.totalViews, icon: TrendingUp, change: 'Acessos no site', changeType: 'neutral', highlight: false },
    { name: 'Leads Novos', value: stats.newLeads, icon: Bell, change: 'Aguardando', changeType: 'neutral', highlight: stats.newLeads > 0 },
  ];

  const leadStatusLabel: Record<string, { label: string; className: string }> = {
    novo: { label: 'Novo', className: 'bg-brand-light text-brand-dark dark:bg-brand-dark/40 dark:text-brand' },
    em_atendimento: { label: 'Em atendimento', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
    finalizado: { label: 'Finalizado', className: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
    cancelado: { label: 'Cancelado', className: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Visão Geral</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Bem-vindo de volta, {user?.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white dark:bg-neutral-900 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <stat.icon className="h-6 w-6 text-neutral-900 dark:text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className={`text-2xl font-semibold ${stat.highlight ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-white'}`}>
                        {stat.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabela de Veículos Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-neutral-900 dark:text-white">
            Veículos Adicionados Recentemente
          </h3>
          <button
            onClick={() => navigate('/admin/veiculos')}
            className="text-sm font-medium text-brand hover:text-brand"
          >
            Ver todos
          </button>
        </div>

        {recentVehicles.length === 0 ? (
          <div className="p-6 text-center text-neutral-500 dark:text-neutral-400">
            Nenhum veículo cadastrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Veículo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Ano</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Cor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Preço</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
                {recentVehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    onClick={() => navigate(`/admin/veiculos/editar/${vehicle.id}`)}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900 dark:text-white">{vehicle.brand} {vehicle.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">{vehicle.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">{vehicle.color}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vehicle.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      <span className="text-sm text-neutral-900 dark:text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vehicle.price)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Seção de Últimos Leads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-neutral-900 dark:text-white">
            Últimos Leads
          </h3>
          <button
            onClick={() => navigate('/admin/relatorios')}
            className="text-sm font-medium text-brand hover:text-brand"
          >
            Ver todos
          </button>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-6 text-center text-neutral-500 dark:text-neutral-400">
            Nenhum lead recebido ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Nome</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Telefone</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Veículo de Interesse</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
                {recentLeads.map((lead) => {
                  const statusInfo = leadStatusLabel[lead.status] || { label: lead.status, className: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400' };
                  return (
                    <tr key={lead.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">{lead.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">{lead.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {lead.vehicles ? `${lead.vehicles.brand} ${lead.vehicles.model}` : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(lead.created_at))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
