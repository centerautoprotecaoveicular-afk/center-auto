export interface QuoteData {
  nome: string;
  telefone: string;
  email: string;
  tipoVeiculo: 'Carro' | 'Moto' | 'Utilitário';
  ano: string;
  modelo: string;
  dataCriacao?: string;
}

export interface CarouselSlide {
  id: string;
  imageUrl: string;
  kicker: string;
  title: string;
  description: string;
  badge?: string;
  textAlign?: 'left' | 'center';
}

export interface CarouselVideo {
  id: string;
  src: string;
  title: string;
  description: string;
}

export interface LeadRecord extends QuoteData {
  id: string;
  timestamp: number;
  status: 'Novo' | 'Contatado' | 'Convertido';
}

export type ReviewCategory = 'assistencia' | 'sinistro' | 'economia';
export type TestimonialStatus = 'pending' | 'approved' | 'rejected';

export interface CustomerTestimonial {
  id: string;
  name: string;
  city: string;
  vehicle: string;
  category: ReviewCategory;
  rating: number;
  quote: string;
  photo?: string;
  createdAt: number;
  status: TestimonialStatus;
}

export type AuthorizedUserRole = 'editor' | 'admin';
export type AuthorizedUserStatus = 'Ativo' | 'Inativo';

export interface AuthorizedUser {
  email: string;
  nome: string;
  role: AuthorizedUserRole;
  status: AuthorizedUserStatus;
  observacoes: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}
