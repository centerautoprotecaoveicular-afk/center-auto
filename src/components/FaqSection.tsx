import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'O que é uma Associação de Proteção Veicular?',
      a: 'A proteção veicular é um sistema cooperativo baseado no socorro mútuo (mutualismo), legalmente amparado pela Constituição Federal e pelo Código Civil Brasileiro. Os associados dividem entre si os custos operacionais e sinistros ocorridos no mês, tornando a proteção até 60% mais econômica do que apólices tradicionais de seguradoras privadas.',
    },
    {
      q: 'Como funciona a indenização de 100% da Tabela FIPE?',
      a: 'Em caso de roubo ou furto não localizado, ou quando os danos por colisão/incêndio ultrapassarem 75% do valor do veículo (perda total caracterizada), a Center Auto indeniza o valor integral de 100% da Tabela FIPE vigente no mês da liquidação do sinistro.',
    },
    {
      q: 'Qualquer pessoa pode dirigir o meu veículo protegido?',
      a: 'Sim! Na Center Auto o condutor é livre. Diferente de seguros tradicionais que cobram mais caro caso motoristas jovens usem o carro, aqui qualquer pessoa devidamente habilitada perante as leis de trânsito brasileiras está totalmente coberta caso conduza seu veículo.',
    },
    {
      q: 'Como acionar o guincho e os serviços de emergência 24h?',
      a: 'Basta discar gratuitamente para a nossa central 0800 591 8936 a qualquer hora do dia ou da noite. Nossa central atende chamados de reboque (até 600km), chaveiro, pane seca, pane elétrica e socorro de borracharia em qualquer rodovia ou cidade do Brasil.',
    },
    {
      q: 'Quem tem restrição no SPC ou Serasa pode contratar?',
      a: 'Com certeza! Como somos uma associação de benefícios e não uma instituição financeira bancária, não fazemos consulta restritiva aos órgãos de proteção ao crédito (SPC/Serasa) nem exigimos análise de perfil de crédito.',
    },
    {
      q: 'Como solicito a 2ª via do meu boleto ou pago por Pix?',
      a: 'Você pode solicitar a 2ª via a qualquer momento diretamente pelo nosso canal no WhatsApp (0800 591 8936 ou 82 99194-5454) ou clicando no botão "2ª Via do Boleto" no topo deste site. Enviamos o PDF com código de barras e chave Pix Copia e Cola para pagamento imediato.',
    },
    {
      q: 'Quanto tempo leva para o meu veículo estar protegido?',
      a: 'Após o preenchimento da proposta e a realização da vistoria prévia (que pode ser feita de forma 100% digital com fotos do celular), seu veículo já passa a ter cobertura ativa a partir das 24 horas seguintes à aprovação da vistoria.',
    },
  ];

  return (
    <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Tire Suas Dúvidas
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0d1e38] mt-2 tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Esclareça rapidamente os principais pontos sobre contratação, pagamentos e coberturas da Center Auto.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-orange-600 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-orange-500 shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-orange-500' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50 animate-fadeIn text-justify">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-white border border-slate-200 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="font-bold text-slate-900 text-base">Ainda tem alguma pergunta?</h4>
            <p className="text-xs text-slate-500">Nosso time de atendimento está pronto para ajudar você.</p>
          </div>
          <a
            href="https://wa.me/5582991945454?text=Ol%C3%A1%2C%20tenho%20uma%20d%C3%BAvida%20sobre%20a%20Center%20Auto."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs uppercase tracking-wide transition-all shadow-sm flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            Falar com um Consultor
          </a>
        </div>

      </div>
    </section>
  );
};
