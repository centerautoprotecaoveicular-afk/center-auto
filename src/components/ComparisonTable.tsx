import React from 'react';
import { Check, X, Shield } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const rows = [
    {
      feature: 'Preço Médio Mensal',
      centerAuto: 'Até 60% mais econômico (a partir de R$ 49,90)',
      traditional: 'Alto custo, reajustes anuais e taxas elevadas',
      highlight: true,
    },
    {
      feature: 'Análise de SPC e Serasa',
      centerAuto: 'Não consulta score ou restrição de crédito',
      traditional: 'Recusa clientes com restrições financeiras',
      highlight: false,
    },
    {
      feature: 'Perfil do Condutor',
      centerAuto: 'Condutor Livre (qualquer motorista habilitado)',
      traditional: 'Restrito a condutor principal (agrava por idade)',
      highlight: false,
    },
    {
      feature: 'Indenização por Perda Total',
      centerAuto: '100% da Tabela FIPE',
      traditional: 'Varia entre 80% e 100% dependendo do contrato',
      highlight: false,
    },
    {
      feature: 'Rastreador via Celular',
      centerAuto: 'Incluso com app liberado em tempo real',
      traditional: 'Cobrado à parte ou restrito a certas categorias',
      highlight: false,
    },
    {
      feature: 'Burocracia na Adesão',
      centerAuto: 'Vistoria 100% digital e ativação imediata',
      traditional: 'Questionários longos e exigências complexas',
      highlight: false,
    },
  ];

  return (
    <section id="diferenciais" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Comparativo Transparente
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0d1e38] mt-2 tracking-tight">
            Center Auto vs. Seguro Tradicional
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Descubra por que milhares de motoristas em Maceió e em todo o Brasil optam pelo clube de benefícios de proteção veicular.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-xs uppercase tracking-wider text-slate-600">
                  <th className="py-4 px-6 font-bold">Critério / Benefício</th>
                  <th className="py-4 px-6 font-extrabold text-[#0d1e38] bg-orange-500/10 border-l border-r border-orange-500/20 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-orange-600">
                      <Shield className="w-4 h-4" />
                      Center Auto
                    </div>
                  </th>
                  <th className="py-4 px-6 font-semibold text-slate-500 text-center">
                    Seguradoras Tradicionais
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      row.highlight ? 'bg-orange-50/30' : ''
                    }`}
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {row.feature}
                    </td>

                    <td className="py-4 px-6 bg-orange-500/5 border-l border-r border-orange-500/10 text-center">
                      <div className="inline-flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{row.centerAuto}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-500 text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm">
                        <X className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 text-center text-xs text-slate-500 border-t border-slate-200">
            A proteção veicular é um sistema cooperativo de socorro mútuo amparado pelo Código Civil Brasileiro.
          </div>
        </div>

      </div>
    </section>
  );
};
