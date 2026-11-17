import React, { useState } from 'react';
import {
  ShieldAlert,
  Headphones,
  Smartphone,
  HeartHandshake,
  Check,
  Flame,
  CloudRain,
  KeyRound,
  Wrench,
  Fuel,
  Navigation,
  Car,
} from 'lucide-react';

export const CoverageSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'coberturas' | 'assistencias' | 'facilidades'>('all');

  const categories = [
    { id: 'all', label: 'Todos os Benefícios' },
    { id: 'coberturas', label: 'Coberturas do Veículo' },
    { id: 'assistencias', label: 'Assistência 24 Horas' },
    { id: 'facilidades', label: 'Tecnologia & Facilidades' },
  ];

  return (
    <section id="coberturas" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Tranquilidade Garantida
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0d1e38] mt-2 tracking-tight">
            Coberturas & Serviços Completos
          </h2>
          <p className="mt-3 text-slate-600 text-base sm:text-lg">
            Tenha a certeza de estar amparado nas situações mais imprevistas do dia a dia, com respaldo financeiro e suporte técnico imediato.
          </p>

          {/* Interactive filter control */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 bg-slate-200/80 rounded-xl max-w-fit mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-white text-[#0d1e38] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Card 1: Coberturas (Col span 7) */}
          {(activeCategory === 'all' || activeCategory === 'coberturas') && (
            <div className="lg:col-span-7 bg-white rounded-2xl p-7 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-orange-600 uppercase">
                      01. Proteção Patrimonial
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0d1e38]">
                      Coberturas de Casco e Sinistros
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-6">
                  Proteção integral contra as principais ocorrências de trânsito e intempéries climáticas, sem letrinhas miúdas.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-slate-900">
                        Roubo, Furto e Incêndio
                      </strong>
                      <span className="text-xs text-slate-500">
                        Indenização garantida caso o veículo não seja recuperado.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <CloudRain className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-slate-900">
                        Fenômenos da Natureza
                      </strong>
                      <span className="text-xs text-slate-500">
                        Danos por alagamentos, quedas de árvores e chuvas de granizo.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-slate-900">
                        100% da Tabela FIPE
                      </strong>
                      <span className="text-xs text-slate-500">
                        Pagamento integral em casos de perda total (PT).
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-slate-900">
                        Até R$ 100 Mil para Terceiros
                      </strong>
                      <span className="text-xs text-slate-500">
                        Proteção para danos materiais causados a outros veículos.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-slate-900">
                        Vidros, Faróis e Retrovisores
                      </strong>
                      <span className="text-xs text-slate-500">
                        Substituição de para-brisa, lanternas e retrovisores trincados.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-xs font-bold text-slate-900">
                        Condutor Livre
                      </strong>
                      <span className="text-xs text-slate-500">
                        Qualquer pessoa devidamente habilitada pode conduzir.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Válido para todo o território nacional</span>
                <span className="font-semibold text-orange-600">Sem análise de perfil</span>
              </div>
            </div>
          )}

          {/* Card 2: Assistências 24h (Col span 5) */}
          {(activeCategory === 'all' || activeCategory === 'assistencias') && (
            <div className="lg:col-span-5 bg-white rounded-2xl p-7 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#0d1e38] flex items-center justify-center">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                      02. Socorro Emergencial
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0d1e38]">
                      Assistência 24 Horas
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-6">
                  Suporte humanizado disponível 365 dias por ano através de central telefônica 0800 gratuita.
                </p>

                <ul className="space-y-3.5">
                  <li className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-orange-500 shrink-0">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold block">Carro Reserva até 30 dias</strong>
                      <span className="text-xs text-slate-500">Não fique a pé durante o reparo do seu veículo.</span>
                    </div>
                  </li>

                  <li className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-orange-500 shrink-0">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold block">Reboque / Guincho até 600 km</strong>
                      <span className="text-xs text-slate-500">Translado seguro em caso de colisão ou pane mecânica.</span>
                    </div>
                  </li>

                  <li className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-orange-500 shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold block">Chaveiro 24 Horas</strong>
                      <span className="text-xs text-slate-500">Abertura e confecção rápida em caso de perda ou tranca.</span>
                    </div>
                  </li>

                  <li className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-orange-500 shrink-0">
                      <Fuel className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 font-semibold block">Pane Seca, Elétrica e Borracharia</strong>
                      <span className="text-xs text-slate-500">Suporte rápido para troca de pneu ou falta de combustível.</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Central 0800 591 8936 ativa agora
              </div>
            </div>
          )}

          {/* Card 3: Tecnologia e Rastreamento (Col span 6) */}
          {(activeCategory === 'all' || activeCategory === 'facilidades') && (
            <div className="lg:col-span-6 bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600 uppercase">
                    03. Conveniência
                  </span>
                  <h3 className="text-xl font-bold text-[#0d1e38]">
                    Tecnologia na Palma da Mão
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-5">
                Modernidade para você gerenciar sua proteção de maneira rápida e segura direto pelo smartphone:
              </p>

              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <Navigation className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Rastreador Veicular com Acesso Liberado:</strong> visualize a localização exata do seu carro ou moto em tempo real via aplicativo.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Boletos no WhatsApp & E-mail:</strong> receba suas mensalidades sem atrasos, com código de barras e Pix Copia e Cola.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Canal de 2ª via imediato:</strong> solicite segunda via ou consulte seu plano em segundos pelo WhatsApp.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Card 4: Sem Burocracia & Humanizado (Col span 6) */}
          {(activeCategory === 'all' || activeCategory === 'facilidades') && (
            <div className="lg:col-span-6 bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-purple-600 uppercase">
                    04. Clube de Benefícios
                  </span>
                  <h3 className="text-xl font-bold text-[#0d1e38]">
                    Atendimento Humanizado
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-5">
                Na Center Auto você não é um número de apólice; é um associado ativo que conta com suporte dedicado:
              </p>

              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero burocracia na contratação:</strong> vistoria rápida online ou presencial sem filas.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Sem análise de score de crédito:</strong> aceitação mesmo para veículos financiados ou proprietários negativados.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Oficinas credenciadas de ponta:</strong> reparos com peças originais e garantia de serviço.
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
