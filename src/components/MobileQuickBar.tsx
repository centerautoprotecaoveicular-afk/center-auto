import React from 'react';
import { MessageCircle, FileText } from 'lucide-react';

interface MobileQuickBarProps {
  onOpenBoletoModal: () => void;
}

export const MobileQuickBar: React.FC<MobileQuickBarProps> = ({ onOpenBoletoModal }) => {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d1e38]/95 backdrop-blur-md border-t border-white/10 px-3 py-2 flex items-center gap-2 shadow-2xl">
      <a
        href="https://wa.me/5582991945454?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20uma%20cota%C3%A7%C3%A3o%20para%20o%20meu%20ve%C3%ADculo."
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap active:scale-95"
      >
        <MessageCircle className="w-4 h-4 shrink-0" />
        <span>Cotar no WhatsApp</span>
      </a>

      <button
        type="button"
        onClick={onOpenBoletoModal}
        className="flex-1 py-2.5 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap active:scale-95 cursor-pointer"
      >
        <FileText className="w-4 h-4 shrink-0" />
        <span>2ª Via Boleto</span>
      </button>
    </div>
  );
};
