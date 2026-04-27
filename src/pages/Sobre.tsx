import { motion } from "framer-motion";
import { Shield, Award, Users, ThumbsUp } from "lucide-react";

export function Sobre() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-black text-white">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1560248454-e0eb862f9eb6?auto=format&fit=crop&q=80&w=2000" 
            alt="Nossa Loja" 
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Nossa História
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-300 font-light"
          >
            Mais de 15 anos transformando o sonho do carro novo em realidade, com transparência e confiança.
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-6">
              A PremiumMotors
            </h2>
            <div className="space-y-4 text-lg text-gray-600 leading-relaxed font-light">
              <p>
                Fundada em 2008, a PremiumMotors nasceu com a missão de elevar o padrão do mercado de veículos seminovos. Acreditamos que a compra de um carro deve ser uma experiência incrível e livre de dores de cabeça.
              </p>
              <p>
                Nossos veículos são rigorosamente selecionados e todos contam com laudo cautelar aprovado, garantindo o máximo de segurança para você e sua família.
              </p>
              <p>
                Com profissionais altamente qualificados e parcerias consolidadas com as principais instituições financeiras, oferecemos as melhores taxas e condições para o seu próximo negócio.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            <img src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=600" alt="Carro em destaque" className="rounded-3xl w-full h-full object-cover aspect-[4/5] shadow-lg" />
            <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600" alt="Nossa equipe" className="rounded-3xl w-full h-full object-cover aspect-[4/5] shadow-lg mt-8" />
          </motion.div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">No Que Acreditamos</h2>
            <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">
              Nossos pilares fundamentais guiam todas as nossas operações e relações com clientes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Transparência", desc: "Clareza em 100% das negociações. Sem letras miúdas ou surpresas." },
              { icon: Award, title: "Qualidade", desc: "Apenas veículos com procedência comprovada e laudo aprovado." },
              { icon: Users, title: "Atendimento", desc: "Foco total na satisfação e no relacionamento duradouro com o cliente." },
              { icon: ThumbsUp, title: "Inovação", desc: "Sempre buscando novas formas de facilitar o processo de compra." }
            ].map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
              >
                <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mb-6">
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-500 leading-relaxed font-light">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
