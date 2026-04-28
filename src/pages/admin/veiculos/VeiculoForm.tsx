import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, UploadCloud, X, Loader2, Image as ImageIcon, Star } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface VehicleFormData {
  brand: string;
  model: string;
  year: string;
  price: number | '';
  mileage: number | '';
  transmission: string;
  fuel_type: string;
  color: string;
  description: string;
  is_featured: boolean;
}

const initialData: VehicleFormData = {
  brand: '',
  model: '',
  year: '',
  price: '',
  mileage: '',
  transmission: 'Automático',
  fuel_type: 'Flex',
  color: '',
  description: '',
  is_featured: false,
};

export function VeiculoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<VehicleFormData>(initialData);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadVehicle();
    }
  }, [id]);

  const loadVehicle = async () => {
    try {
      // Load vehicle data
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (vehicleError) throw vehicleError;

      setFormData({
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        mileage: vehicle.mileage,
        transmission: vehicle.transmission,
        fuel_type: vehicle.fuel_type,
        color: vehicle.color,
        description: vehicle.description || '',
        is_featured: vehicle.is_featured,
      });

      // Load existing images
      const { data: images, error: imagesError } = await supabase
        .from('vehicle_images')
        .select('*')
        .eq('vehicle_id', id);

      if (imagesError) throw imagesError;
      setExistingImages(images || []);
    } catch (err: any) {
      console.error('Erro ao carregar veículo:', err);
      setError('Não foi possível carregar os dados do veículo.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: value ? Number(value) : '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const setAsPrimary = async (imageId: string) => {
    try {
      // Remove primary de todas as imagens do veículo
      await supabase
        .from('vehicle_images')
        .update({ is_primary: false })
        .eq('vehicle_id', id);

      // Define a selecionada como primary
      await supabase
        .from('vehicle_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      setExistingImages(prev =>
        prev.map(img => ({ ...img, is_primary: img.id === imageId }))
      );
    } catch (err) {
      console.error('Erro ao definir imagem destaque:', err);
      alert('Erro ao definir imagem destaque.');
    }
  };

  const removeExistingImage = async (imageId: string, url: string) => {
    if (!window.confirm('Excluir esta foto permanentemente?')) return;
    
    try {
      // Deleta do DB
      await supabase.from('vehicle_images').delete().eq('id', imageId);
      
      // Tenta deletar do Storage (o caminho da url)
      const filePath = url.split('/').pop(); // simplificação
      if (filePath) {
        await supabase.storage.from('car-photos').remove([filePath]);
      }
      
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      console.error('Erro ao excluir foto:', err);
      alert('Erro ao excluir foto.');
    }
  };

  const generateSlug = () => {
    const text = `${formData.brand} ${formData.model} ${formData.year}`;
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  };

  const uploadPhotos = async (vehicleId: string) => {
    const uploadPromises = selectedFiles.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${vehicleId}/${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('car-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('car-photos')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    });

    const urls = await Promise.all(uploadPromises);

    if (urls.length > 0) {
      const imageRecords = urls.map(url => ({
        vehicle_id: vehicleId,
        url,
        is_primary: false,
      }));

      await supabase.from('vehicle_images').insert(imageRecords);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let currentVehicleId = id;

      const vehicleData = {
        ...formData,
        mileage: formData.mileage === '' ? null : Number(formData.mileage),
        slug: generateSlug() + (isEditing ? '' : `-${Math.random().toString(36).substring(2, 6)}`),
      };

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', id);
        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from('vehicles')
          .insert([vehicleData])
          .select()
          .single();
        if (insertError) throw insertError;
        currentVehicleId = data.id;
      }

      if (selectedFiles.length > 0 && currentVehicleId) {
        await uploadPhotos(currentVehicleId);
      }

      navigate('/admin/veiculos');
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      setError(err.message || 'Ocorreu um erro ao salvar o veículo.');
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
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/veiculos')}
          className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {isEditing ? 'Editar Veículo' : 'Novo Veículo'}
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-3">
            Informações Básicas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Marca</label>
              <input type="text" name="brand" required value={formData.brand} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors" placeholder="Ex: Honda" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Modelo</label>
              <input type="text" name="model" required value={formData.model} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors" placeholder="Ex: Civic Touring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Ano</label>
              <input type="text" name="year" required value={formData.year} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors" placeholder="Ex: 2023 ou 2023/2024" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Preço (R$)</label>
              <input type="number" name="price" required value={formData.price} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors" placeholder="Ex: 145000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Quilometragem (km)</label>
              <input type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors" placeholder="Ex: 15000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Cor</label>
              <input type="text" name="color" required value={formData.color} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors" placeholder="Ex: Prata" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Câmbio</label>
              <select name="transmission" value={formData.transmission} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors">
                <option value="Automático">Automático</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Combustível</label>
              <select name="fuel_type" value={formData.fuel_type} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors">
                <option value="Flex">Flex</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Etanol">Etanol</option>
                <option value="Diesel">Diesel</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Elétrico">Elétrico</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Descrição</label>
            <textarea name="description" rows={4} value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-neutral-900 dark:bg-neutral-950 dark:text-white transition-colors" placeholder="Descreva os detalhes, opcionais e estado de conservação..." />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="is_featured" name="is_featured" checked={formData.is_featured} onChange={handleInputChange} className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
            <label htmlFor="is_featured" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Destacar este veículo na página inicial
            </label>
          </div>
        </div>

        {/* Galeria de Fotos */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-3">
            Fotos do Veículo
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Imagens Existentes (Edição) */}
            {existingImages.map((img) => (
              <div key={img.id} className={`relative group aspect-video rounded-lg overflow-hidden border-2 transition-all ${img.is_primary ? 'border-brand' : 'border-neutral-200 dark:border-neutral-700'}`}>
                <img src={img.url} alt="Carro" className="w-full h-full object-cover" />
                {img.is_primary && (
                  <div className="absolute top-2 left-2 bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> Destaque
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAsPrimary(img.id)}
                    className={`p-1.5 rounded-full text-white transition-colors ${img.is_primary ? 'bg-brand' : 'bg-white/20 hover:bg-brand'}`}
                    title="Definir como destaque"
                  >
                    <Star className={`w-4 h-4 ${img.is_primary ? 'fill-white' : ''}`} />
                  </button>
                  <button type="button" onClick={() => removeExistingImage(img.id, img.url)} className="p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-full transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Novas Imagens Selecionadas */}
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-brand border-2">
                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-brand text-white text-xs px-2 py-1 rounded shadow">Novo</span>
                </div>
                <button type="button" onClick={() => removeSelectedFile(idx)} className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Botão Upload */}
            <label className="aspect-video rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 dark:hover:border-neutral-500 transition-colors flex flex-col items-center justify-center cursor-pointer bg-neutral-50 dark:bg-neutral-950/50 hover:bg-neutral-100 dark:hover:bg-neutral-900">
              <UploadCloud className="w-8 h-8 text-neutral-400 mb-2" />
              <span className="text-sm font-medium text-neutral-500 text-center px-2">Adicionar Fotos</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin/veiculos')} className="px-6 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-70 transition-colors">
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {saving ? 'Salvando...' : 'Salvar Veículo'}
          </button>
        </div>
      </form>
    </div>
  );
}
