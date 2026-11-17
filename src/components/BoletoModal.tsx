import React, { useState } from 'react';
import { X, FileText, MessageCircle, Phone, CheckCircle, QrCode } from 'lucide-react';

interface BoletoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BoletoModal: React.FC<BoletoModalProps> = ({ isOpen, onClose }) => {
  const [cpf, setCpf] = useState('');
  const [placa, setPlaca] = useState('');

  if (!isOpen) return null;

  const handleRequestBoleto = (channel: '0800' | 'zap') => {
    let msg = `Olá, gostaria de solicitar a 2ª via do meu boleto da Center Auto Proteção Veicular.`;
    if (cpf.trim()) msg += `\n*CPF:* ${cpf}`;
    if (placa.trim()) msg += `\n*Placa do Veículo:* ${placa.toUpperCase()}`;

    const phone = channel === '0800' ? '5508005918936' : '5582991945454';
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#0d1e38] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Solicitar 2ª Via de Boleto</h3>
              <p className="text-xs text-slate-300">
                Atendimento rápido para associados Center Auto
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-600">
            Você pode receber a segunda via do seu boleto ou chave Pix instantânea diretamente no WhatsApp com nossos atendentes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CPF do Associado (opcional)
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Placa do Veículo (opcional)
              </label>
              <input
                type="text"
                placeholder="ABC-1234"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleRequestBoleto('0800')}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              Solicitar via WhatsApp Central (0800 591 8936)
            </button>

            <button
              onClick={() => handleRequestBoleto('zap')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              Ou solicitar via WhatsApp Regional: (82) 99194-5454
            </button>
          </div>

          {/* Payment convenience highlights */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <QrCode className="w-3.5 h-3.5 text-orange-500" />
              <span>Opções de Pagamento:</span>
            </div>
            <p>• Pix Copia e Cola com baixa instantânea.</p>
            <p>• Código de barras para pagamento em qualquer banco ou lotérica.</p>
          </div>
        </div>

        <div className="p-4 bg-slate-100 text-center text-xs text-slate-500 border-t border-slate-200">
          Center Auto Proteção Veicular · Todos os direitos reservados.
        </div>

      </div>
    </div>
  );
};
