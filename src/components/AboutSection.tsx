import React from 'react';
import { Target, Eye, ShieldCheck, Heart, Award, Zap, Handshake } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const valores = [
    {
      icon: Handshake,
      title: 'Transparência',
      desc: 'Agimos com clareza e honestidade em todas as nossas relações e contratos.',
    },
    {
      icon: Heart,
      title: 'Comprometimento',
      desc: 'Dedicação total à segurança, tranquilidade e satisfação de cada associado.',
    },
    {
      icon: Award,
      title: 'Excelência',
      desc: 'Busca contínua pelo aprimoramento dos serviços e rapidez nos processos.',
    },
    {
      icon: Zap,
      title: 'Agilidade',
      desc: 'Respostas imediatas e envio célere de guincho e socorro quando você mais precisa.',
    },
    {
      icon: ShieldCheck,
      title: 'Confiança',
      desc: 'Relacionamento sólido baseado na credibilidade, integridade e respeito mútuo.',
    },
  ];

  return (
    <section id="sobre" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Nossa História e Propósito
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0d1e38] mt-2 tracking-tight">
            Quem Somos
          </h2>
          <p className="mt-3 text-slate-600 text-base leading-relaxed text-justify">
            A <strong>Center Auto Proteção Veicular</strong> é uma associação de benefícios mútuos com sede em Maceió/AL e atendimento em todo o Brasil. Nascemos com o propósito de democratizar o acesso à segurança veicular com transparência, humanização e custos justos.
          </p>
        </div>

        {/* Missão e Visão Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[#0d1e38] mb-3">Nossa Missão</h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base text-justify">
              Proporcionar proteção veicular de excelência, garantindo a tranquilidade e a segurança de nossos associados por meio de um serviço ético, transparente, ágil e eficiente, em conformidade com o mutualismo legal.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#0d1e38] flex items-center justify-center mb-5">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[#0d1e38] mb-3">Nossa Visão</h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base text-justify">
              Ser a principal referência no mercado de proteção veicular em Alagoas e no Nordeste, amplamente reconhecida pela qualidade ímpar dos serviços, inovação tecnológica e compromisso intransigente com o associado.
            </p>
          </div>
        </div>

        {/* Nossos Valores */}
        <div>
          <h3 className="text-center text-xl sm:text-2xl font-bold text-[#0d1e38] mb-8">
            Nossos Valores Fundamentais
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {valores.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-slate-200 text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-[#0d1e38] text-base mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
