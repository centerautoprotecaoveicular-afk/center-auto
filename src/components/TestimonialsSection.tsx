import React, { useState } from 'react';
import { Star, Quote } from 'lucide-react';
import customerReviewOne from '../assets/images/customer_review_one_1795094073671.jpg';
import customerReviewTwo from '../assets/images/customer_review_two_1795094073892.jpg';
import customerReviewThree from '../assets/images/customer_review_three_1795094075150.jpg';
import customerReviewFour from '../assets/images/customer_review_four_1795094073618.jpg';

type ReviewCategory = 'todos' | 'assistencia' | 'sinistro' | 'economia';

interface TestimonialItem {
  id: string;
  name: string;
  initials: string;
  city: string;
  vehicle: string;
  category: Exclude<ReviewCategory, 'todos'>;
  categoryLabel: string;
  rating: number;
  date: string;
  photo: string;
  quote: string;
}

const TESTIMONIALS: TestimonialItem[] = [
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

const FILTER_OPTIONS: { id: ReviewCategory; label: string }[] = [
  { id: 'todos', label: 'Todas as Avaliações' },
  { id: 'assistencia', label: 'Assistência 24h' },
  { id: 'sinistro', label: 'Colisão e Reparo' },
  { id: 'economia', label: 'Economia e Adesão' },
];

export const TestimonialsSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<ReviewCategory>('todos');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const visibleTestimonials =
    activeFilter === 'todos'
      ? TESTIMONIALS
      : TESTIMONIALS.filter((item) => item.category === activeFilter);

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
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

          <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-0.5 text-amber-400"
                aria-label="Média de 4,9 de 5 estrelas"
              >
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="text-lg font-extrabold text-white tabular-nums">
                4,9 / 5,0
              </span>
            </div>
            <p className="text-xs text-slate-300 tabular-nums">
              Baseado em +1.400 atendimentos avaliados em Alagoas e no Brasil
            </p>
          </div>
        </div>

        {/* Interactive Category Filter Tabs */}
        <div
          className="flex flex-wrap items-center gap-2 mb-8"
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

        {/* Testimonials Grid */}
        <div
          className={`grid grid-cols-1 gap-6 ${
            visibleTestimonials.length === 1
              ? 'md:grid-cols-1 max-w-2xl'
              : 'md:grid-cols-2'
          }`}
        >
          {visibleTestimonials.map((review) => {
            const hasImageError = failedImages[review.id];

            return (
              <article
                key={review.id}
                className="bg-white text-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between gap-5"
              >
                <div>
                  {/* Reviewer Header: Photo + Identity + Stars */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {hasImageError ? (
                        <div
                          className="w-14 h-14 rounded-full bg-[#0d1e38] text-orange-400 font-extrabold text-sm flex items-center justify-center shrink-0 border border-slate-200"
                          aria-hidden="true"
                        >
                          {review.initials}
                        </div>
                      ) : (
                        <img
                          src={review.photo}
                          alt={`Foto de ${review.name}, associado Center Auto`}
                          referrerPolicy="no-referrer"
                          onError={() => handleImageError(review.id)}
                          className="w-14 h-14 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                      )}

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
            );
          })}
        </div>
      </div>
    </section>
  );
};
