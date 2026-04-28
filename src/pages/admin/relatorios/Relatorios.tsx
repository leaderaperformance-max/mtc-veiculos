import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const STATUS_OPTIONS = ['novo', 'em_atendimento', 'finalizado'] as const;
type LeadStatus = typeof STATUS_OPTIONS[number];

const statusColors: Record<LeadStatus, string> = {
  novo: 'bg-brand-light text-brand-dark dark:bg-brand-dark/30 dark:text-brand',
  em_atendimento: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  finalizado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

function buildLast7DaysMap(): { label: string; date: string }[] {
  const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const result: { label: string; date: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD
    result.push({ label: DAY_LABELS[d.getDay()], date: dateStr });
  }
  return result;
}

export function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ name: string; leads: number; views: number }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const days = buildLast7DaysMap();

      // Leads dos últimos 7 dias para a tabela
      const { data: recentLeads } = await supabase
        .from('leads')
        .select(`
          id,
          name,
          phone,
          email,
          created_at,
          status,
          vehicles ( brand, model )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (recentLeads) setLeads(recentLeads);

      // Leads por dia (últimos 7 dias)
      const { data: leadsForChart } = await supabase
        .from('leads')
        .select('created_at')
        .gte('created_at', since);

      const leadsByDay: Record<string, number> = {};
      days.forEach(({ date }) => { leadsByDay[date] = 0; });
      if (leadsForChart) {
        leadsForChart.forEach((row) => {
          const date = row.created_at.slice(0, 10);
          if (date in leadsByDay) leadsByDay[date]++;
        });
      }

      // Page views por dia (últimos 7 dias)
      const { data: viewsForChart } = await supabase
        .from('page_views')
        .select('created_at')
        .gte('created_at', since);

      const viewsByDay: Record<string, number> = {};
      days.forEach(({ date }) => { viewsByDay[date] = 0; });
      if (viewsForChart) {
        viewsForChart.forEach((row) => {
          const date = row.created_at.slice(0, 10);
          if (date in viewsByDay) viewsByDay[date]++;
        });
      }

      const combined = days.map(({ label, date }) => ({
        name: label,
        leads: leadsByDay[date] ?? 0,
        views: viewsByDay[date] ?? 0,
      }));

      setChartData(combined);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);

    if (!error) {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
    } else {
      console.error('Erro ao atualizar status:', error);
    }
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
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Relatórios e Estatísticas</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Acompanhe o desempenho de vendas e acessos da sua loja.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 shadow-sm">
          <Calendar className="w-4 h-4 text-neutral-500" />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Últimos 7 dias</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Visualizações (Linha) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-brand" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Visualizações do Site</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }}
                />
                <Line type="monotone" dataKey="views" name="Visualizações" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Gráfico de Leads (Barras) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Leads (Contatos)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="leads" name="Leads" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Tabela de Leads Recentes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-neutral-900 shadow-sm border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg leading-6 font-medium text-neutral-900 dark:text-white">
            Últimos Contatos Recebidos
          </h3>
        </div>

        {leads.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4">
              <Users className="w-6 h-6 text-neutral-400" />
            </div>
            <h3 className="text-sm font-medium text-neutral-900 dark:text-white mb-1">Nenhum lead ainda</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Quando clientes preencherem formulários no site, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
              <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Contato</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Veículo de Interesse</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
                {leads.map((lead) => {
                  const currentStatus: LeadStatus = STATUS_OPTIONS.includes(lead.status) ? lead.status : 'novo';
                  return (
                    <tr key={lead.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">{lead.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-white">{lead.phone}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {lead.vehicles ? `${lead.vehicles.brand} ${lead.vehicles.model}` : 'Contato Geral'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-neutral-400 ${statusColors[currentStatus]}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                              {opt.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
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
