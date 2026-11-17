import React from 'react';
import { DollarSign, Shield, Truck, Clock, Users } from 'lucide-react';

export const TrustStats: React.FC = () => {
  const stats = [
    {
      icon: DollarSign,
      value: 'R$ 49,90',
      unit: '/mês',
      title: 'Planos Acessíveis',
      desc: 'Valores que cabem no seu bolso sem surpresas',
    },
    {
      icon: Shield,
      value: '100%',
      unit: 'FIPE',
      title: 'Indenização Integral',
      desc: 'Pagamento total em caso de perda ou roubo',
    },
    {
      icon: Truck,
      value: '600 km',
      unit: 'reboque',
      title: 'Guincho Estendido',
      desc: 'Socorro rápido na cidade ou em rodovias',
    },
    {
      icon: Clock,
      value: '24h',
      unit: '/dia',
      title: 'Central Nacional',
      desc: '0800 gratuito disponível 7 dias por semana',
    },
    {
      icon: Users,
      value: '100%',
      unit: 'livre',
      title: 'Condutor Livre',
      desc: 'Qualquer motorista habilitado está protegido',
    },
  ];

  return (
    <section className="bg-white border-b border-slate-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-baseline justify-center gap-1 font-mono tabular-nums">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#0d1e38]">
                    {item.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-800 mt-1">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[180px] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
