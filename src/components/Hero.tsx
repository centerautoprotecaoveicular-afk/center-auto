import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  MessageCircle,
  Car,
  Bike,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  Image as ImageIcon,
  Film,
  Play,
} from 'lucide-react';
import { QuoteData, CarouselSlide, CarouselVideo } from '../types';
import { saveLead } from '../utils/storage';
import { MediaImage, MediaVideoPlayer } from './MediaRenderer';

interface HeroProps {
  carouselSlides: CarouselSlide[];
  carouselVideos: CarouselVideo[];
  onOpenBoletoModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  carouselSlides,
  carouselVideos,
  onOpenBoletoModal,
}) => {
  const [mediaTab, setMediaTab] = useState<'photos' | 'videos'>('photos');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentVideoSlide, setCurrentVideoSlide] = useState(0);

  const [formData, setFormData] = useState<QuoteData>({
    nome: '',
    telefone: '',
    email: '',
    tipoVeiculo: 'Carro',
    ano: '',
    modelo: '',
  });
  const [submitted, setSubmitted] = useState(false);

  // Clamp indices when slides or videos list changes
  useEffect(() => {
    if (carouselSlides.length > 0 && currentSlide >= carouselSlides.length) {
      setCurrentSlide(0);
    }
  }, [carouselSlides.length, currentSlide]);

  useEffect(() => {
    if (carouselVideos.length > 0 && currentVideoSlide >= carouselVideos.length) {
      setCurrentVideoSlide(0);
    }
  }, [carouselVideos.length, currentVideoSlide]);

  // Auto slide timer for photos only
  useEffect(() => {
    if (mediaTab !== 'photos' || !carouselSlides || carouselSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [carouselSlides, mediaTab]);

  const handlePrevSlide = () => {
    if (mediaTab === 'photos') {
      setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
    } else {
      if (carouselVideos.length > 0) {
        setCurrentVideoSlide((prev) => (prev - 1 + carouselVideos.length) % carouselVideos.length);
      }
    }
  };

  const handleNextSlide = () => {
    if (mediaTab === 'photos') {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    } else {
      if (carouselVideos.length > 0) {
        setCurrentVideoSlide((prev) => (prev + 1) % carouselVideos.length);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Store lead locally for association administration
    saveLead(formData);
    setSubmitted(true);

    const numeroWhatsApp = '5582991945454';
    const mensagem =
      `*Solicitação de Cotação - Center Auto Proteção Veicular*\n\n` +
      `👤 *Nome:* ${formData.nome}\n` +
      `📱 *Telefone / WhatsApp:* ${formData.telefone}\n` +
      `✉️ *E-mail:* ${formData.email}\n` +
      `🚗 *Tipo:* ${formData.tipoVeiculo}\n` +
      `🏷️ *Modelo:* ${formData.modelo}\n` +
      `📅 *Ano:* ${formData.ano}\n\n` +
      `Gostaria de receber uma simulação dos planos disponíveis!`;

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

    setTimeout(() => {
      window.open(url, '_blank');
      setSubmitted(false);
    }, 400);
  };

  const activeVideo = carouselVideos[currentVideoSlide] || carouselVideos[0];

  return (
    <section className="relative bg-gradient-to-br from-[#0a172c] via-[#0d1e38] to-[#152b4d] text-white pt-8 pb-16 lg:py-16 overflow-hidden">
      {/* Background subtle geometric accents */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          
          {/* Left Column: Proposition & Media Showcase (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Value Kicker */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Planos a partir de R$ 49,90/mês
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight text-balance">
                Proteção completa e acessível para o seu veículo.
              </h1>

              {/* Subtitle */}
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl text-justify">
                A <strong className="text-white">Center Auto Proteção Veicular</strong> é o seu clube de benefícios completo. Proteja seu carro ou moto com cobertura nacional, 100% da Tabela FIPE, reboque até 600km, rastreador e assistência 24h sem burocracia ou análise de perfil.
              </p>
            </div>

            {/* Media Selector & Carousel Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                {/* Media Switcher: Fotos / Vídeos */}
                <div className="inline-flex p-1 bg-[#091527] border border-white/10 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMediaTab('photos')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                      mediaTab === 'photos'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Fotos ({carouselSlides.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaTab('videos')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                      mediaTab === 'videos'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Vídeos ({carouselVideos.length})</span>
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  {mediaTab === 'photos' ? 'Destaques e Coberturas' : 'Apresentação em Vídeo'}
                </span>
              </div>

              {/* Visual Showcase (Photos or Videos) */}
              <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
                
                {/* PHOTOS MODE */}
                {mediaTab === 'photos' && (
                  <>
                    {carouselSlides.map((slide, idx) => (
                      <div
                        key={slide.id || idx}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                          idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                      >
                        <MediaImage
                          src={slide.imageUrl}
                          alt={slide.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        {/* Dynamic custom text overlay from the text editor */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-t from-[#0d1e38]/95 via-[#0d1e38]/40 to-black/20 flex items-end p-6 sm:p-7 ${
                            slide.textAlign === 'center' ? 'justify-center text-center' : 'justify-start text-left'
                          }`}
                        >
                          <div className="space-y-1.5 max-w-xl">
                            {slide.kicker && (
                              <span className="text-xs uppercase font-extrabold text-orange-400 tracking-wider block">
                                {slide.kicker}
                              </span>
                            )}
                            <h4 className="text-lg sm:text-2xl font-extrabold text-white leading-tight">
                              {slide.title}
                            </h4>
                            {slide.description && (
                              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                                {slide.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Carousel navigation controls */}
                    {carouselSlides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevSlide}
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-orange-500 text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
                          aria-label="Slide anterior"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={handleNextSlide}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-orange-500 text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
                          aria-label="Próximo slide"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                          {carouselSlides.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCurrentSlide(idx)}
                              className={`h-2 rounded-full transition-all cursor-pointer ${
                                idx === currentSlide ? 'w-6 bg-orange-500' : 'w-2 bg-white/40'
                              }`}
                              aria-label={`Ir para foto ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* VIDEOS MODE */}
                {mediaTab === 'videos' && (
                  <div className="w-full h-full relative z-10 bg-black overflow-hidden">
                    {carouselVideos.length === 0 ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                        <Play className="w-10 h-10 text-orange-500 mx-auto opacity-70" />
                        <h4 className="text-sm font-bold text-white">Nenhum vídeo cadastrado</h4>
                        <p className="text-xs text-slate-400">
                          Adicione links do YouTube ou faça upload de vídeos no Painel do Administrador.
                        </p>
                      </div>
                    ) : (
                      <>
                        <MediaVideoPlayer
                          key={activeVideo.id || activeVideo.src}
                          src={activeVideo.src}
                          title={activeVideo.title || `Vídeo Center Auto ${currentVideoSlide + 1}`}
                        />

                        {activeVideo?.title && (
                          <div className="absolute top-3 left-3 z-20 max-w-[80%] pointer-events-none">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-950/75 border border-white/15 text-[11px] font-semibold text-white truncate max-w-full">
                              {activeVideo.title}
                            </span>
                          </div>
                        )}

                        {/* Video carousel navigation controls */}
                        {carouselVideos.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={handlePrevSlide}
                              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-orange-500 text-white flex items-center justify-center transition-colors border border-white/20 cursor-pointer shadow-lg"
                              aria-label="Vídeo anterior"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>

                            <button
                              type="button"
                              onClick={handleNextSlide}
                              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-orange-500 text-white flex items-center justify-center transition-colors border border-white/20 cursor-pointer shadow-lg"
                              aria-label="Próximo vídeo"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>

                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/10">
                              {carouselVideos.map((_, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setCurrentVideoSlide(idx)}
                                  className={`h-2 rounded-full transition-all cursor-pointer ${
                                    idx === currentVideoSlide ? 'w-5 bg-orange-500' : 'w-2 bg-white/40'
                                  }`}
                                  aria-label={`Ir para vídeo ${idx + 1}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick trust checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-300 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
                <span>100% Tabela FIPE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Guincho até 600km</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Condutor Livre</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Sem Consulta SPC</span>
              </div>
            </div>
          </div>

          {/* Right Column: Lead Quoting Form Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
              <div className="text-center mb-6">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                  Cotação Instantânea Online
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  Proteja seu patrimônio
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Preencha os dados e receba a simulação direta no WhatsApp em poucos minutos.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-emerald-900 text-lg">Cotação Enviada!</h4>
                  <p className="text-xs text-emerald-800">
                    Estamos redirecionando você para o WhatsApp do nosso consultor...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Vehicle Type Selector Tabs */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Tipo de Veículo
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipoVeiculo: 'Carro' })}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          formData.tipoVeiculo === 'Carro'
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Car className="w-3.5 h-3.5" />
                        Carro
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipoVeiculo: 'Moto' })}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          formData.tipoVeiculo === 'Moto'
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Bike className="w-3.5 h-3.5" />
                        Moto
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipoVeiculo: 'Utilitário' })}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          formData.tipoVeiculo === 'Utilitário'
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5" />
                        SUV / Picape
                      </button>
                    </div>
                  </div>

                  {/* Nome Completo */}
                  <div>
                    <label htmlFor="nome" className="block text-xs font-bold text-slate-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      id="nome"
                      type="text"
                      required
                      placeholder="Ex: João da Silva"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Telefone WhatsApp */}
                  <div>
                    <label htmlFor="telefone" className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp com DDD
                    </label>
                    <input
                      id="telefone"
                      type="tel"
                      required
                      placeholder="(82) 99999-9999"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* E-mail */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
                      E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="seuemail@exemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Ano e Modelo */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="ano" className="block text-xs font-bold text-slate-700 mb-1">
                        Ano Fab./Mod.
                      </label>
                      <input
                        id="ano"
                        type="text"
                        required
                        placeholder="Ex: 2022"
                        value={formData.ano}
                        onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="modelo" className="block text-xs font-bold text-slate-700 mb-1">
                        Modelo do Veículo
                      </label>
                      <input
                        id="modelo"
                        type="text"
                        required
                        placeholder="Ex: Onix 1.0, Fan 160"
                        value={formData.modelo}
                        onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm uppercase tracking-wide transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    Enviar e Cotar Agora
                  </button>
                </form>
              )}

              {/* Boleto divider & fast button */}
              <div className="mt-5 pt-4 border-t border-slate-200 text-center">
                <span className="text-xs text-slate-500 block mb-2">Já é associado Center Auto?</span>
                <button
                  type="button"
                  onClick={onOpenBoletoModal}
                  className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Solicitar 2ª Via do Boleto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
