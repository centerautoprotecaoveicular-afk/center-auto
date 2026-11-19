import React from 'react';

const WHATSAPP_URL =
  'https://wa.me/5582991945454?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20o%20atendimento%20da%20Center%20Auto%20Prote%C3%A7%C3%A3o%20Veicular.';

export const WhatsAppFloatingButton: React.FC = () => {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com o atendimento da Center Auto no WhatsApp"
      title="Atendimento via WhatsApp: (82) 99194-5454"
      className="group fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2.5 focus:outline-none"
    >
      {/* Desktop hover label */}
      <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg bg-[#0d1e38] text-white text-xs font-semibold shadow-lg border border-white/10 opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all duration-200 whitespace-nowrap">
        Atendimento WhatsApp
      </span>

      {/* Circular FAB */}
      <span className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xl shadow-emerald-950/30 ring-2 ring-white/80 transition-all duration-200 group-hover:scale-105 group-active:scale-95">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="w-7 h-7"
        >
          <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.391c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.813 14.125c-.25.703-1.438 1.344-2 1.422-.516.078-1.172.109-1.891-.125-.438-.141-1-.328-1.719-.641-3.016-1.297-4.984-4.328-5.141-4.531-.141-.203-1.219-1.625-1.219-3.094 0-1.469.766-2.188 1.047-2.484.281-.297.609-.375.813-.375.203 0 .406.016.578.016.188 0 .438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.094.203-.141.328-.297.5-.156.172-.313.391-.453.516-.156.141-.313.297-.141.594.172.297.781 1.297 1.672 2.094 1.156 1.031 2.125 1.344 2.422 1.5.297.156.469.125.641-.078.172-.203.75-.875.953-1.172.203-.297.406-.25.672-.156.266.094 1.719.813 2.016.953.297.156.484.219.563.344.078.125.078.734-.172 1.438z" />
        </svg>
        <span
          aria-hidden="true"
          className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-300 border-2 border-emerald-600"
        />
      </span>
    </a>
  );
};
