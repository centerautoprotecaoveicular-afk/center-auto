import { LeadRecord, CarouselSlide, CarouselVideo } from '../types';

export const ALLOWED_ADMIN_EMAIL = 'centerauto.protecaoveicular@gmail.com';
export const DEFAULT_ADMIN_USER = 'centerauto';
export const INITIAL_ADMIN_PASS = 'Sr2025#4';

export function getStoredAdminUser(): string {
  try {
    const val = localStorage.getItem('adminUser');
    if (!val || val === 'admin') {
      localStorage.setItem('adminUser', DEFAULT_ADMIN_USER);
      return DEFAULT_ADMIN_USER;
    }
    return val;
  } catch {
    return DEFAULT_ADMIN_USER;
  }
}

export function getStoredAdminPassword(): string {
  try {
    const val = localStorage.getItem('adminPass');
    if (!val || val === 'admin123') {
      localStorage.setItem('adminPass', INITIAL_ADMIN_PASS);
      return INITIAL_ADMIN_PASS;
    }
    return val;
  } catch {
    return INITIAL_ADMIN_PASS;
  }
}

export function hasDefinitivePassword(): boolean {
  try {
    return localStorage.getItem('hasDefinitivePass') === 'true';
  } catch {
    return false;
  }
}

export function saveDefinitivePassword(password: string): void {
  try {
    localStorage.setItem('adminPass', password);
    localStorage.setItem('hasDefinitivePass', 'true');
  } catch (e) {
    console.error('Failed to save definitive password', e);
  }
}

export function generateRecoveryCode(): string {
  // Generate a random 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    sessionStorage.setItem(
      'admin_recovery_token',
      JSON.stringify({
        code,
        expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes validity
      })
    );
  } catch (e) {
    console.error('Failed to store recovery token', e);
  }
  return code;
}

export function verifyRecoveryCode(inputCode: string): boolean {
  try {
    const raw = sessionStorage.getItem('admin_recovery_token');
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.code || !data.expiresAt) return false;
    if (Date.now() > data.expiresAt) return false;
    return data.code === inputCode.trim();
  } catch {
    return false;
  }
}

export function clearRecoveryCode(): void {
  try {
    sessionStorage.removeItem('admin_recovery_token');
  } catch {
    // ignore
  }
}

export const DEFAULT_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'slide_1',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    kicker: 'Associação de Benefícios',
    title: 'Proteção total para seu carro ou moto',
    description: 'Cobertura nacional completa contra roubo, colisão e fenômenos da natureza.',
  },
  {
    id: 'slide_2',
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
    kicker: 'Socorro Imediato 24h',
    title: 'Assistência em qualquer lugar do Brasil',
    description: 'Guincho até 600km, chaveiro, pane elétrica e socorro de borracharia.',
  },
  {
    id: 'slide_3',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    kicker: 'Sem Burocracia',
    title: 'Tranquilidade sem análise de perfil ou SPC',
    description: 'Condutor livre e indenização integral de 100% da Tabela FIPE.',
  },
];

export const DEFAULT_CAROUSEL_IMAGES = DEFAULT_CAROUSEL_SLIDES.map((s) => s.imageUrl);

// Default video slots for the 4 side-by-side video windows
export const DEFAULT_CAROUSEL_VIDEO_ITEMS: CarouselVideo[] = [
  {
    id: 'video_1',
    src: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    title: '01. Apresentação Center Auto',
    description: 'Conheça nossa associação e a estrutura de proteção para seu veículo.',
  },
  {
    id: 'video_2',
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: '02. Assistência 24h & Reboque',
    description: 'Saiba como funciona o socorro emergencial, guincho 600km e chaveiro.',
  },
  {
    id: 'video_3',
    src: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
    title: '03. Rastreamento pelo Celular',
    description: 'Aplicativo em tempo real para monitorar a localização do seu carro ou moto.',
  },
  {
    id: 'video_4',
    src: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
    title: '04. Clube de Benefícios',
    description: 'Vantagens exclusivas, sem consulta ao SPC/Serasa e condutor livre.',
  },
];

export const DEFAULT_CAROUSEL_VIDEOS = DEFAULT_CAROUSEL_VIDEO_ITEMS.map((v) => v.src);

export function getStoredCarouselSlides(): CarouselSlide[] {
  try {
    const raw = localStorage.getItem('carouselSlides');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Fallback: check if legacy carouselImages array exists
    const rawImages = localStorage.getItem('carouselImages');
    if (rawImages) {
      const parsedImgs = JSON.parse(rawImages);
      if (Array.isArray(parsedImgs) && parsedImgs.length > 0) {
        return parsedImgs.map((img: string, idx: number) => ({
          id: `slide_${idx + 1}`,
          imageUrl: img,
          kicker: idx === 0 ? 'Associação de Benefícios' : idx === 1 ? 'Assistência 24h' : 'Clube de Benefícios',
          title: idx === 0 ? 'Proteção total para seu veículo' : idx === 1 ? 'Socorro em todo o Brasil' : 'Sem burocracia ou SPC',
          description: 'Adesão facilitada com atendimento humanizado.',
        }));
      }
    }
  } catch (err) {
    console.warn('Error reading carouselSlides from localStorage', err);
  }
  return DEFAULT_CAROUSEL_SLIDES;
}

export function saveStoredCarouselSlides(slides: CarouselSlide[]): boolean {
  try {
    localStorage.setItem('carouselSlides', JSON.stringify(slides));
    localStorage.setItem('carouselImages', JSON.stringify(slides.map((s) => s.imageUrl)));
    return true;
  } catch (err) {
    console.error('Error saving carouselSlides to localStorage', err);
    return false;
  }
}

export function getStoredCarouselImages(): string[] {
  return getStoredCarouselSlides().map((s) => s.imageUrl);
}

export function saveStoredCarouselImages(images: string[]) {
  const currentSlides = getStoredCarouselSlides();
  const updatedSlides: CarouselSlide[] = images.map((img, idx) => {
    const existing = currentSlides[idx];
    return {
      id: existing?.id || `slide_${Date.now()}_${idx}`,
      imageUrl: img,
      kicker: existing?.kicker || 'Associação de Benefícios',
      title: existing?.title || `Destaque ${idx + 1}`,
      description: existing?.description || 'Proteção completa e acessível.',
    };
  });
  saveStoredCarouselSlides(updatedSlides);
}

export function getStoredCarouselVideoItems(): CarouselVideo[] {
  try {
    const rawItems = localStorage.getItem('carouselVideoItems');
    if (rawItems !== null) {
      const parsed = JSON.parse(rawItems);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          id: item?.id || `video_${idx + 1}`,
          src: typeof item?.src === 'string' ? item.src : '',
          title:
            typeof item?.title === 'string'
              ? item.title
              : DEFAULT_CAROUSEL_VIDEO_ITEMS[idx]?.title || `Vídeo 0${idx + 1}`,
          description:
            typeof item?.description === 'string'
              ? item.description
              : DEFAULT_CAROUSEL_VIDEO_ITEMS[idx]?.description ||
                'Conteúdo informativo Center Auto Proteção Veicular.',
        }));
      }
    }

    // Legacy migration: migrate string[] from carouselVideos preserving order & default texts
    const rawLegacy = localStorage.getItem('carouselVideos');
    if (rawLegacy !== null) {
      const parsedLegacy = JSON.parse(rawLegacy);
      if (Array.isArray(parsedLegacy)) {
        return parsedLegacy.map((src: string, idx: number) => ({
          id: `video_${idx + 1}`,
          src: typeof src === 'string' ? src : '',
          title: DEFAULT_CAROUSEL_VIDEO_ITEMS[idx]?.title || `Vídeo 0${idx + 1}`,
          description:
            DEFAULT_CAROUSEL_VIDEO_ITEMS[idx]?.description ||
            'Conteúdo informativo Center Auto Proteção Veicular.',
        }));
      }
    }
  } catch (err) {
    console.warn('Error reading carouselVideoItems from localStorage', err);
  }
  return DEFAULT_CAROUSEL_VIDEO_ITEMS;
}

export function saveStoredCarouselVideoItems(items: CarouselVideo[]): boolean {
  try {
    localStorage.setItem('carouselVideoItems', JSON.stringify(items));
    localStorage.setItem('carouselVideos', JSON.stringify(items.map((v) => v.src)));
    return true;
  } catch (err) {
    console.error('Error saving carouselVideoItems to localStorage', err);
    return false;
  }
}

export function getStoredCarouselVideos(): string[] {
  return getStoredCarouselVideoItems().map((v) => v.src);
}

export function saveStoredCarouselVideos(videos: string[]): boolean {
  const current = getStoredCarouselVideoItems();
  const updated: CarouselVideo[] = videos.map((src, idx) => ({
    id: current[idx]?.id || `video_${Date.now()}_${idx}`,
    src,
    title:
      current[idx]?.title ||
      DEFAULT_CAROUSEL_VIDEO_ITEMS[idx]?.title ||
      `Vídeo 0${idx + 1}`,
    description:
      current[idx]?.description ||
      DEFAULT_CAROUSEL_VIDEO_ITEMS[idx]?.description ||
      'Conteúdo informativo Center Auto Proteção Veicular.',
  }));
  return saveStoredCarouselVideoItems(updated);
}

export interface ParsedVideo {
  type: 'youtube' | 'vimeo' | 'direct';
  src: string;
}

export function parseVideoSource(url: string): ParsedVideo {
  if (!url) return { type: 'direct', src: '' };

  const trimmed = url.trim();

  // YouTube matchers
  const ytMatch =
    trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/) ||
    trimmed.match(/^[a-zA-Z0-9_-]{11}$/);

  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
    };
  }

  // Vimeo matcher
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  return {
    type: 'direct',
    src: trimmed,
  };
}

export function getStoredLeads(): LeadRecord[] {
  try {
    const raw = localStorage.getItem('centerauto_leads');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading leads', e);
  }
  return [];
}

export function saveLead(lead: Omit<LeadRecord, 'id' | 'timestamp' | 'status'>): LeadRecord {
  const current = getStoredLeads();
  const newLead: LeadRecord = {
    ...lead,
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    status: 'Novo',
  };
  current.unshift(newLead);
  localStorage.setItem('centerauto_leads', JSON.stringify(current));
  return newLead;
}

export function exportLeadsToCSV(leads: LeadRecord[]) {
  if (leads.length === 0) return;
  const headers = ['Data/Hora', 'Nome', 'Telefone', 'E-mail', 'Tipo Veículo', 'Ano', 'Modelo', 'Status'];
  const rows = leads.map((l) => [
    new Date(l.timestamp).toLocaleString('pt-BR'),
    `"${l.nome.replace(/"/g, '""')}"`,
    `"${l.telefone}"`,
    `"${l.email}"`,
    l.tipoVeiculo,
    l.ano,
    `"${l.modelo.replace(/"/g, '""')}"`,
    l.status,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `leads_center_auto_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
