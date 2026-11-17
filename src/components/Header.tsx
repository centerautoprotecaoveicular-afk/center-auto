import React, { useState } from 'react';
import { Menu, X, FileText, Phone } from 'lucide-react';

interface HeaderProps {
  onOpenBoletoModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBoletoModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative bg-[#0d1e38] border-b border-white/10 text-white">
      {/* Top microbar for emergency and 24h assistance */}
      <div className="bg-[#091527] text-xs text-slate-300 py-1.5 px-4 sm:px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-orange-400 font-medium">
              <Phone className="w-3.5 h-3.5" />
              Central 24h & Reboque:
            </span>
            <a
              href="tel:08005918936"
              className="hover:text-white font-semibold transition-colors"
            >
              0800 591 8936
            </a>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-300">
              Maceió/AL e Cobertura Nacional
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <a
              href="https://wa.me/5582991945454"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              WhatsApp: (82) 99194-5454
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 min-h-32 sm:min-h-36 md:min-h-44 flex items-center justify-between gap-6 sm:gap-8">
        {/* Zone 1: Brand Logo Image */}
        <a
          href="#"
          className="flex items-center group whitespace-nowrap shrink-0 focus:outline-none"
        >
          <img
            src="./assets/aistudio/logo_center_auto_a66a14f9.jpeg"
            alt="Center Auto Proteção Veicular"
            className="h-28 sm:h-36 md:h-44 lg:h-48 w-auto object-contain rounded-xl transition-transform group-hover:scale-102 drop-shadow-xl"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src.indexOf('logo-center-auto.jpeg') === -1) {
                target.src = './logo-center-auto.jpeg';
              }
            }}
          />
        </a>

        {/* Zone 2: 4-5 single-line clean navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-200">
          <a
            href="#sobre"
            className="hover:text-orange-400 transition-colors whitespace-nowrap shrink-0"
          >
            Sobre Nós
          </a>
          <a
            href="#coberturas"
            className="hover:text-orange-400 transition-colors whitespace-nowrap shrink-0"
          >
            Coberturas & Serviços
          </a>
          <a
            href="#diferenciais"
            className="hover:text-orange-400 transition-colors whitespace-nowrap shrink-0"
          >
            Vantagens
          </a>
          <a
            href="#videos"
            className="hover:text-orange-400 transition-colors whitespace-nowrap shrink-0"
          >
            Vídeos
          </a>
          <a
            href="#faq"
            className="hover:text-orange-400 transition-colors whitespace-nowrap shrink-0"
          >
            Dúvidas Frequentes
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenBoletoModal}
            className="px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs tracking-wide uppercase transition-all shadow-md shadow-orange-500/25 flex items-center gap-2 whitespace-nowrap shrink-0 active:scale-95 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            2ª Via do Boleto
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d1e38] border-b border-white/10 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <a
            href="#sobre"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-200 hover:text-orange-400 hover:bg-white/5 rounded-lg"
          >
            Sobre Nós
          </a>
          <a
            href="#coberturas"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-200 hover:text-orange-400 hover:bg-white/5 rounded-lg"
          >
            Coberturas & Serviços
          </a>
          <a
            href="#diferenciais"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-200 hover:text-orange-400 hover:bg-white/5 rounded-lg"
          >
            Vantagens
          </a>
          <a
            href="#videos"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-200 hover:text-orange-400 hover:bg-white/5 rounded-lg"
          >
            Vídeos
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-200 hover:text-orange-400 hover:bg-white/5 rounded-lg"
          >
            Dúvidas Frequentes
          </a>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBoletoModal();
              }}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-center flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Solicitar 2ª Via do Boleto
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
