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
