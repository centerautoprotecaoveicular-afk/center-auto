import React, { useState } from 'react';
import {
  Star,
  Quote,
  MessageSquarePlus,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CustomerTestimonial, ReviewCategory } from '../types';
import {
  submitTestimonialToFirestore,
  compressImageToDataUrl,
} from '../utils/firestoreDb';
import { useResolvedMediaUrl } from '../utils/mediaDb';
import customerReviewOne from '../assets/images/customer_review_one_1795094073671.jpg';
import customerReviewTwo from '../assets/images/customer_review_two_1795094073892.jpg';
import customerReviewThree from '../assets/images/customer_review_three_1795094075150.jpg';
import customerReviewFour from '../assets/images/customer_review_four_1795094073618.jpg';

type FilterCategory = 'todos' | ReviewCategory;

interface DisplayTestimonial {
  id: string;
  name: string;
  initials: string;
  city: string;
  vehicle: string;
  category: ReviewCategory;
  categoryLabel: string;
  rating: number;
  date: string;
  photo?: string;
  quote: string;
}

interface TestimonialsSectionProps {
  userTestimonials: CustomerTestimonial[];
  onTestimonialSubmitted: (item: CustomerTestimonial) => void;
}

const CATEGORY_LABELS: Record<ReviewCategory, string> = {
  assistencia: 'Assistência 24h',
  sinistro: 'Colisão e Reparo',
  economia: 'Economia e Adesão',
};

const DEFAULT_TESTIMONIALS: DisplayTestimonial[] = [
  {
    id: 'rev-1',
    name: 'Rafael Mendonça',
    initials: 'RM',
    city: 'Maceió, AL',
    vehicle: 'Toyota Corolla 2022',
    category: 'assistencia',
    categoryLabel: 'Reboque 24h',
    rating: 5,
    date: 'Outubro 2026',
    photo: customerReviewOne,
    quote:
      'Tive pane elétrica na AL-101 às 23h voltando de viagem. Liguei no 0800 e em 38 minutos o guincho chegou, levou o carro até a oficina e resolveu tudo sem eu pagar nada além da mensalidade.',
  },
  {
    id: 'rev-2',
    name: 'Camila Vasconcelos',
    initials: 'CV',
    city: 'Arapiraca, AL',
    vehicle: 'Jeep Renegade 2023',
    category: 'economia',
    categoryLabel: 'Economia Anual',
    rating: 5,
    date: 'Setembro 2026',
    photo: customerReviewTwo,
    quote:
      'Pagava quase R$ 4.800 por ano em seguradora tradicional porque meu marido e meu filho também dirigem. Na Center Auto o condutor é livre e passei a economizar mais de R$ 2.100 por ano com cobertura 100% FIPE.',
  },
  {
    id: 'rev-3',
    name: 'Edson Cavalcante',
    initials: 'EC',
    city: 'Marechal Deodoro, AL',
    vehicle: 'Chevrolet S10 2021',
    category: 'sinistro',
    categoryLabel: 'Reparo de Colisão',
    rating: 5,
    date: 'Agosto 2026',
    photo: customerReviewThree,
    quote:
      'Uso a caminhonete para entregas todo dia. Quando bateram no meu para-choque e farol, enviei as fotos pelo WhatsApp e em poucos dias a oficina credenciada já estava com as peças originais liberadas.',
  },
  {
    id: 'rev-4',
    name: 'Larissa Ferreira',
    initials: 'LF',
    city: 'Maceió, AL',
    vehicle: 'Volkswagen Polo 2023',
    category: 'economia',
    categoryLabel: 'Vistoria Digital',
    rating: 5,
    date: 'Novembro 2026',
    photo: customerReviewFour,
    quote:
      'Contratei tudo pelo celular em menos de um dia, sem consulta ao SPC e sem burocracia. O rastreador e o clube de descontos em farmácias e oficinas fazem diferença real no orçamento do mês.',
  },
];

const FILTER_OPTIONS: { id: FilterCategory; label: string }[] = [
  { id: 'todos', label: 'Todas as Avaliações' },
  { id: 'assistencia', label: 'Assistência 24h' },
  { id: 'sinistro', label: 'Colisão e Reparo' },
  { id: 'economia', label: 'Economia e Adesão' },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatMonthYear(timestamp: number): string {
  const formatted = new Date(timestamp).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

const TestimonialAvatar: React.FC<{
  photo?: string;
  name: string;
  initials: string;
}> = ({ photo, name, initials }) => {
  const resolvedPhoto = useResolvedMediaUrl(photo || '');
  const [hasError, setHasError] = useState(false);

  if (!photo || !resolvedPhoto || hasError) {
    return (
      <div
        className="w-14 h-14 rounded-full bg-[#0d1e38] text-orange-400 font-extrabold text-sm flex items-center justify-center shrink-0 border border-slate-200"
        aria-hidden="true"
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={resolvedPhoto}
      alt={`Foto de ${name}, associado Center Auto`}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className="w-14 h-14 rounded-full object-cover shrink-0 border border-slate-200"
    />
  );
};

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  userTestimonials,
  onTestimonialSubmitted,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('todos');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [category, setCategory] = useState<ReviewCategory>('assistencia');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [quote, setQuote] = useState('');
  const [photoRef, setPhotoRef] = useState('');
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [formError, setFormError] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState('');

  // Only approved user reviews are published publicly
  const approvedUserItems: DisplayTestimonial[] = userTestimonials
    .filter((item) => item.status === 'approved')
    .map((item) => ({
      id: item.id,
      name: item.name,
      initials: getInitials(item.name),
      city: item.city,
      vehicle: item.vehicle,
      category: item.category,
      categoryLabel: CATEGORY_LABELS[item.category],
      rating: item.rating,
      date: formatMonthYear(item.createdAt),
      photo: item.photo,
      quote: item.quote,
    }));

  const allApprovedReviews = [...approvedUserItems, ...DEFAULT_TESTIMONIALS];

  const visibleTestimonials =
    activeFilter === 'todos'
      ? allApprovedReviews
      : allApprovedReviews.filter((item) => item.category === activeFilter);

  const averageRating =
    allApprovedReviews.length > 0
      ? allApprovedReviews.reduce((sum, item) => sum + item.rating, 0) /
        allApprovedReviews.length
      : 4.9;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormError('');
    if (!file.type.startsWith('image/')) {
      setFormError('Selecione um arquivo de imagem válido (JPG, PNG ou WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('A foto deve ter no máximo 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const compressedDataUrl = await compressImageToDataUrl(file, 360, 340000);
      setPhotoRef(compressedDataUrl);
      setPhotoPreviewUrl(compressedDataUrl);
    } catch {
      setFormError('Não foi possível processar a imagem selecionada. Escolha outra foto menor.');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleClearPhoto = () => {
    setPhotoRef('');
    setPhotoPreviewUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmittedNotice('');

    const cleanName = name.trim();
    const cleanCity = city.trim();
    const cleanVehicle = vehicle.trim();
    const cleanQuote = quote.trim();

    if (cleanName.length < 3) {
      setFormError('Informe seu nome completo.');
      return;
    }
    if (cleanCity.length < 2) {
      setFormError('Informe sua cidade e estado (ex.: Maceió, AL).');
      return;
    }
    if (cleanVehicle.length < 2) {
      setFormError('Informe o modelo do seu veículo.');
      return;
    }
    if (cleanQuote.length < 15) {
      setFormError('Escreva um comentário com pelo menos 15 caracteres.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const created = await submitTestimonialToFirestore({
        name: cleanName,
        city: cleanCity,
        vehicle: cleanVehicle,
        category,
        rating,
        quote: cleanQuote,
        photo: photoRef || undefined,
      });

      onTestimonialSubmitted(created);
      setName('');
      setCity('');
      setVehicle('');
      setCategory('assistencia');
      setRating(5);
      setHoverRating(0);
      setQuote('');
      handleClearPhoto();
      setIsFormOpen(false);
      setSubmittedNotice(
        'Avaliação enviada com sucesso! Seu comentário aguarda aprovação do administrador para ser exibido no site.'
      );
    } catch {
      setFormError('Não foi possível enviar sua avaliação no momento. Tente novamente.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <section
      id="depoimentos"
      className="py-20 bg-[#0d1e38] text-white border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header + Aggregate Rating */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Avaliações de Associados
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 tracking-tight text-balance">
              Quem Roda Protegido Recomenda
            </h2>
            <p className="mt-3 text-slate-300 text-base leading-relaxed">
              Relatos reais de motoristas que acionaram nosso reboque 24h, utilizaram a cobertura contra colisão ou migraram para economizar mantendo 100% da Tabela FIPE.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-0.5 text-amber-400"
                aria-label={`Média de ${averageRating.toFixed(1).replace('.', ',')} de 5 estrelas`}
              >
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="text-lg font-extrabold text-white tabular-nums">
                {averageRating.toFixed(1).replace('.', ',')} / 5,0
              </span>
            </div>
            <p className="text-xs text-slate-300 tabular-nums">
              {allApprovedReviews.length} avaliações publicadas · +1.400 atendimentos em Alagoas e no Brasil
            </p>
          </div>
        </div>

        {/* Category Filter Tabs + Write Review CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div
            className="flex flex-wrap items-center gap-2"
            role="tablist"
            aria-label="Filtrar avaliações por tipo de atendimento"
          >
            {FILTER_OPTIONS.map((option) => {
              const isActive = activeFilter === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveFilter(option.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsFormOpen((prev) => !prev);
              setSubmittedNotice('');
              setFormError('');
            }}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {isFormOpen ? (
              <>
                <X className="w-4 h-4" />
                <span>Fechar Formulário</span>
              </>
            ) : (
              <>
                <MessageSquarePlus className="w-4 h-4" />
                <span>Deixar Avaliação</span>
              </>
            )}
          </button>
        </div>

        {/* Confirmation Notice after submission */}
        {submittedNotice && (
          <div
            role="status"
            className="mb-8 p-4 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-100 text-sm flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">{submittedNotice}</p>
            </div>
          </div>
        )}

        {/* User Review Submission Form */}
        {isFormOpen && (
          <div className="mb-10 bg-white text-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg">
            <div className="flex items-start justify-between gap-4 pb-4 mb-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#0d1e38]">
                  Envie sua Avaliação sobre a Center Auto
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Compartilhe sua experiência. Todos os comentários passam por aprovação do administrador antes de aparecerem no site.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Fechar formulário de avaliação"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="review-name"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Seu Nome *
                  </label>
                  <input
                    id="review-name"
                    type="text"
                    required
                    maxLength={60}
                    placeholder="Ex.: Marcos Antônio"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="review-city"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Cidade / UF *
                  </label>
                  <input
                    id="review-city"
                    type="text"
                    required
                    maxLength={50}
                    placeholder="Ex.: Maceió, AL"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="review-vehicle"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Veículo *
                  </label>
                  <input
                    id="review-vehicle"
                    type="text"
                    required
                    maxLength={50}
                    placeholder="Ex.: Hyundai HB20 2022"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div>
                  <label
                    htmlFor="review-category"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Motivo da Avaliação *
                  </label>
                  <select
                    id="review-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ReviewCategory)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="assistencia">Assistência 24h</option>
                    <option value="sinistro">Colisão e Reparo</option>
                    <option value="economia">Economia e Adesão</option>
                  </select>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sua Nota *
                  </span>
                  <div className="flex items-center gap-1.5 py-1.5">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const active = value <= (hoverRating || rating);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          onMouseEnter={() => setHoverRating(value)}
                          onMouseLeave={() => setHoverRating(0)}
                          aria-label={`Dar ${value} ${value === 1 ? 'estrela' : 'estrelas'}`}
                          className="p-1 rounded-md hover:scale-110 transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              active
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 text-xs font-bold text-slate-700 tabular-nums">
                      {rating}/5
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-1.5">
                    Foto do Associado ou Veículo (Opcional)
                  </span>
                  <div className="flex items-center gap-3">
                    {photoPreviewUrl ? (
                      <div className="flex items-center gap-2.5">
                        <img
                          src={photoPreviewUrl}
                          alt="Pré-visualização da foto"
                          className="w-10 h-10 rounded-full object-cover border border-slate-300"
                        />
                        <button
                          type="button"
                          onClick={handleClearPhoto}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors">
                        {isUploadingPhoto ? (
                          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                        ) : (
                          <Upload className="w-4 h-4 text-slate-500" />
                        )}
                        <span>{isUploadingPhoto ? 'Carregando...' : 'Anexar foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="review-quote"
                    className="block text-xs font-bold text-slate-700"
                  >
                    Seu Comentário *
                  </label>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {quote.length}/400
                  </span>
                </div>
                <textarea
                  id="review-quote"
                  required
                  rows={3}
                  maxLength={400}
                  placeholder="Conte como foi o atendimento, a contratação ou o acionamento da proteção..."
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-500">
                  Moderação ativa: comentários são publicados após validação do administrador.
                </p>
                <div className="flex items-center gap-2.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingPhoto || isSubmittingReview}
                    className="px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm inline-flex items-center gap-2"
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Avaliação'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Testimonials Grid */}
        {visibleTestimonials.length === 0 ? (
          <div className="rounded-2xl border border-white/15 bg-white/5 p-10 text-center text-sm text-slate-300">
            Nenhuma avaliação encontrada nesta categoria ainda.
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-6 ${
              visibleTestimonials.length === 1
                ? 'md:grid-cols-1 max-w-2xl'
                : 'md:grid-cols-2'
            }`}
          >
            {visibleTestimonials.map((review) => (
              <article
                key={review.id}
                className="bg-white text-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between gap-5"
              >
                <div>
                  {/* Reviewer Header: Photo + Identity + Stars */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <TestimonialAvatar
                        photo={review.photo}
                        name={review.name}
                        initials={review.initials}
                      />

                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-[#0d1e38] truncate">
                          {review.name}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5 truncate">
                          <span>{review.city}</span>
                          <span aria-hidden="true" className="mx-1.5 text-slate-400">
                            ·
                          </span>
                          <span>{review.vehicle}</span>
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1 shrink-0 pt-0.5"
                      aria-label={`Nota ${review.rating} de 5 estrelas`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs font-bold text-slate-700 tabular-nums">
                        {review.rating.toFixed(1).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-sm sm:text-[15px] text-slate-700 leading-relaxed flex gap-2.5">
                    <Quote
                      className="w-4 h-4 text-orange-500 shrink-0 mt-1"
                      aria-hidden="true"
                    />
                    <span>{review.quote}</span>
                  </blockquote>
                </div>

                {/* Unboxed Metadata Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-500">
                  <span>
                    <strong className="font-semibold text-slate-700">
                      {review.categoryLabel}
                    </strong>
                    <span aria-hidden="true" className="mx-1.5 text-slate-400">
                      ·
                    </span>
                    <span>Associado Verificado</span>
                  </span>
                  <span className="tabular-nums shrink-0">{review.date}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
