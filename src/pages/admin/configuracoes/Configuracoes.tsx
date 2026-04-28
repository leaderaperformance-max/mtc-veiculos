import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Store, Phone, Mail, MapPin, Instagram, Facebook, FileText, Clock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface StoreSettings {
  id: string;
  store_name: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram_url: string;
  facebook_url: string;
  cnpj: string;
  opening_hours: string;
}

export function Configuracoes() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('store_settings')
        .update({
          store_name: settings.store_name,
          whatsapp: settings.whatsapp,
          email: settings.email,
          address: settings.address,
          instagram_url: settings.instagram_url,
          facebook_url: settings.facebook_url,
          cnpj: settings.cnpj,
          opening_hours: settings.opening_hours,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      
      // Limpa a mensagem após 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setMessage({ type: 'error', text: 'Ocorreu um erro ao salvar as configurações.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Configurações da Loja</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Gerencie as informações públicas que aparecerão no site principal.
          </p>
        </div>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' 
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção Dados da Loja */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-neutral-500" />
            Dados Principais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nome da Loja</label>
              <input type="text" name="store_name" required value={settings?.store_name || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors" placeholder="Ex: Auto Motors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-400" /> CNPJ
              </label>
              <input type="text" name="cnpj" value={settings?.cnpj || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors" placeholder="00.000.000/0001-00" />
            </div>
          </div>
        </div>

        {/* Seção Contato */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-neutral-500" />
            Contato e Localização
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-500" /> WhatsApp
              </label>
              <input type="text" name="whatsapp" value={settings?.whatsapp || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors" placeholder="(11) 99999-9999" />
              <p className="mt-1 text-xs text-neutral-500">Apenas números, ou no formato (DD) XXXXX-XXXX</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4 text-neutral-400" /> E-mail Público
              </label>
              <input type="email" name="email" value={settings?.email || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors" placeholder="contato@loja.com.br" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" /> Endereço Completo
              </label>
              <input type="text" name="address" value={settings?.address || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors" placeholder="Av. Principal, 1000 - Centro, São Paulo - SP" />
            </div>
          </div>
        </div>

        {/* Seção Redes Sociais */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white flex items-center gap-2">
            Redes Sociais
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" /> Instagram URL
              </label>
              <input type="url" name="instagram_url" value={settings?.instagram_url || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors" placeholder="https://instagram.com/sua_loja" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-2">
                <Facebook className="w-4 h-4 text-brand" /> Facebook URL
              </label>
              <input type="url" name="facebook_url" value={settings?.facebook_url || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors" placeholder="https://facebook.com/sua_loja" />
            </div>
          </div>
        </div>

        {/* Seção Horário */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-neutral-500" />
            Horário de Funcionamento
          </h3>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Horários
            </label>
            <textarea
              name="opening_hours"
              rows={4}
              value={settings?.opening_hours || ''}
              onChange={handleInputChange}
              placeholder={"Seg a Sex: 09h às 19h\nSáb: 09h às 14h\nDom: Fechado"}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors resize-none"
            />
            <p className="mt-1 text-xs text-neutral-500">Uma linha por período. Ex: "Seg a Sex: 09h às 19h"</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-70 transition-colors">
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}
