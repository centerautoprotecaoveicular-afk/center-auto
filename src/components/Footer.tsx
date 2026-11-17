import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Lock,
  Instagram,
  Youtube,
  MessageCircle,
} from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenBoleto: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenBoleto }) => {
  return (
    <footer className="bg-[#091527] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-14">
          
          {/* Col 1: Brand & Description (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <a href="#" className="inline-block group focus:outline-none">
              <img
                src="./assets/aistudio/logo_2-_center_auto__abbb9560.jpg"
                alt="Center Auto Proteção Veicular"
                className="h-24 sm:h-28 w-auto object-contain rounded-xl transition-transform group-hover:scale-102"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.indexOf('logo-2-center-auto.jpg') === -1) {
                    target.src = './logo-2-center-auto.jpg';
                  }
                }}
              />
            </a>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed text-justify">
              Na Center Auto Proteção Veicular, você não é apenas um cliente, é um associado que conta com o suporte de uma equipe dedicada e a segurança de ter seu patrimônio protegido. Venha fazer parte do nosso clube de benefícios e dirija com total tranquilidade!
            </p>

            <div className="pt-2">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-3">
                Siga nossas Redes Sociais
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.instagram.com/centerprotecaoveicular/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram da Center Auto"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-red-500 hover:to-purple-500 text-white flex items-center justify-center transition-all hover:scale-110"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                <a
                  href="https://wa.me/5582991945454"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp da Center Auto"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-emerald-600 text-white flex items-center justify-center transition-all hover:scale-110"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>

                <a
                  href="https://www.youtube.com/@centerautoprotecaoveicular/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube da Center Auto"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-red-600 text-white flex items-center justify-center transition-all hover:scale-110"
                >
                  <Youtube className="w-4 h-4" />
                </a>

                <a
                  href="https://www.pinterest.com/centerautoprotecaoveicular"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest da Center Auto"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-red-700 text-white flex items-center justify-center transition-all hover:scale-110 text-xs font-bold"
                >
                  P
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-bold text-sm uppercase tracking-wider text-orange-400">
              Navegação Rápida
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li>
                <a href="#sobre" className="hover:text-orange-400 transition-colors">
                  Sobre a Associação
                </a>
              </li>
              <li>
                <a href="#coberturas" className="hover:text-orange-400 transition-colors">
                  Coberturas & Assistências
                </a>
              </li>
              <li>
                <a href="#diferenciais" className="hover:text-orange-400 transition-colors">
                  Por que a Center Auto?
                </a>
              </li>
              <li>
                <a href="#videos" className="hover:text-orange-400 transition-colors">
                  Vídeos & Apresentações
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-orange-400 transition-colors">
                  Dúvidas Frequentes
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenBoleto}
                  className="text-orange-400 hover:text-orange-300 font-semibold cursor-pointer text-left"
                >
                  Solicitar 2ª Via de Boleto
                </button>
              </li>
              <li className="pt-2">
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  Área do Administrador
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Central & Atendimento (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wider text-orange-400">
              Canais de Atendimento
            </h4>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Central 24h & Reboque Nacional:</strong>
                  <a href="tel:08005918936" className="text-orange-400 font-bold hover:underline">
                    0800 591 8936
                  </a>
                  <span className="text-slate-400 text-xs block">Ligação gratuita em todo o país</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">WhatsApp Regional / Vendas:</strong>
                  <a
                    href="https://wa.me/5582991945454"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-200 hover:text-white"
                  >
                    (82) 99194-5454
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">E-mail de Contato:</strong>
                  <a
                    href="mailto:centerauto.protecaoveicular@gmail.com"
                    className="text-slate-200 hover:text-white"
                  >
                    centerauto.protecaoveicular@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Sede Física em Maceió/AL:</strong>
                  <a
                    href="https://maps.app.goo.gl/5UzcT7xBvweJWKv4A"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-orange-400 transition-colors block text-xs leading-relaxed"
                  >
                    Av. Juca Sampaio, 2247 / Cond. Shopping Miramar / Sala 42 - Cruz das Almas, Maceió - AL, CEP: 57038-005
                    <span className="text-orange-400 block mt-0.5 font-medium underline">
                      Ver localização no Google Maps →
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Center Auto Proteção Veicular. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Portal Oficial:</span>
            <a
              href="https://centerauto.protecaooveicular.ai.studio"
              className="text-orange-400 hover:text-orange-300 font-mono transition-colors"
            >
              centerauto.protecaooveicular.ai.studio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
