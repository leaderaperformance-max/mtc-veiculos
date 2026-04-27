import { motion } from "framer-motion";
import { storeConfig } from "../data/mock";
import { Phone, MapPin, Mail, Clock, MessageCircle } from "lucide-react";

export function Contato() {
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de falar com um consultor.");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24"
    >
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4"
        >
          Fale Conosco
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-500 font-light max-w-2xl mx-auto"
        >
          Nossa equipe está pronta para te atender e tirar todas as suas dúvidas.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        {/* Contact Info & Map */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-12"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <a 
              href={`https://wa.me/${storeConfig.whatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all block"
            >
              <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">WhatsApp</h3>
              <p className="text-gray-500 font-medium">Respondemos rápido</p>
            </a>
            
            <a 
              href={`tel:${storeConfig.phone.replace(/[^0-9]/g, '')}`}
              className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all block"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Telefone Fixo</h3>
              <p className="text-gray-500 font-medium">{storeConfig.phone}</p>
            </a>
          </div>

          <div className="space-y-6 bg-gray-50 p-8 rounded-3xl">
            <div className="flex items-start">
              <Mail className="w-6 h-6 text-gray-400 mt-1 mr-4 shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900">E-mail</h4>
                <a href={`mailto:${storeConfig.email}`} className="text-gray-500 hover:text-black transition-colors">{storeConfig.email}</a>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="w-6 h-6 text-gray-400 mt-1 mr-4 shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900">Endereço</h4>
                <p className="text-gray-500">
                  {storeConfig.address}<br />
                  {storeConfig.city} - {storeConfig.state}<br />
                  CEP: {storeConfig.zip_code}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="w-6 h-6 text-gray-400 mt-1 mr-4 shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900">Horário de Funcionamento</h4>
                <p className="text-gray-500 whitespace-pre-line">{storeConfig.opening_hours}</p>
              </div>
            </div>
          </div>

          {/* Map (Placeholder using generic image or iframe wrapper) */}
          <div className="aspect-video rounded-3xl overflow-hidden bg-gray-200 border border-gray-100 relative">
             <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14620.25203006001!2d-46.689104!3d-23.6378824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDM4JzE2LjQiUyA0NsKwNDEnMjAuOCJX!5e0!3m2!1spt-BR!2sbr!4v1614000000000!5m2!1spt-BR!2sbr" 
               className="absolute inset-0 w-full h-full border-0" 
               allowFullScreen={false} 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
             ></iframe>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Envie uma mensagem</h2>
          
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input 
                type="text" 
                id="name" 
                placeholder="Seu nome"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
                <input 
                  type="tel" 
                  id="phone" 
                  placeholder="(00) 00000-0000"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="seu@email.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Assunto</label>
              <select 
                id="subject"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition-all appearance-none"
              >
                <option value="duvida">Dúvida geral</option>
                <option value="financiamento">Financiamento</option>
                <option value="vender">Quero vender meu carro</option>
                <option value="reclamacao">Reclamação/Sugestão</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mensagem</label>
              <textarea 
                id="message" 
                rows={5}
                placeholder="Como podemos te ajudar?"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black transition-all resize-none"
              />
            </div>

            <div className="pt-4">
              <p className="text-xs text-gray-500 mb-6 font-light">
                Ao enviar esta mensagem, você concorda com nossa Política de Privacidade e consente que seus dados sejam processados para fins de contato.
              </p>
              <button 
                type="submit"
                className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors text-lg"
              >
                Enviar Mensagem
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
