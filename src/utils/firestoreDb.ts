import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  QuoteData,
  LeadRecord,
  CarouselSlide,
  CarouselVideo,
  CustomerTestimonial,
  TestimonialStatus,
  AuthorizedUser,
  AuthorizedUserRole,
  AuthorizedUserStatus,
} from '../types';
import {
  ALLOWED_ADMIN_EMAIL,
  DEFAULT_CAROUSEL_SLIDES,
  DEFAULT_CAROUSEL_VIDEO_ITEMS,
} from './storage';

function sanitizeId(rawId: string, prefix: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  if (cleaned.length > 0) return cleaned;
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function clampString(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

function timestampToMs(ts: unknown): number {
  if (ts instanceof Timestamp) {
    return ts.toMillis();
  }
  if (typeof ts === 'number') {
    return ts;
  }
  if (ts && typeof (ts as { toMillis?: () => number }).toMillis === 'function') {
    return (ts as { toMillis: () => number }).toMillis();
  }
  return Date.now();
}

const EMAIL_ID_REGEX = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;

export interface AdminAccessInfo {
  authorized: boolean;
  isMaster: boolean;
  role: 'master' | AuthorizedUserRole | null;
  displayName?: string;
}

export async function getAdminAccessInfo(
  email?: string | null,
  emailVerified?: boolean | null
): Promise<AdminAccessInfo> {
  if (!email || !emailVerified) {
    return { authorized: false, isMaster: false, role: null };
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail === ALLOWED_ADMIN_EMAIL.toLowerCase()) {
    return {
      authorized: true,
      isMaster: true,
      role: 'master',
      displayName: 'Administrador Master',
    };
  }
  if (!EMAIL_ID_REGEX.test(normalizedEmail) || normalizedEmail.length > 150) {
    return { authorized: false, isMaster: false, role: null };
  }
  try {
    const snap = await getDoc(doc(db, 'authorizedUsers', normalizedEmail));
    if (!snap.exists()) {
      return { authorized: false, isMaster: false, role: null };
    }
    const data = snap.data();
    if (data.status !== 'Ativo') {
      return { authorized: false, isMaster: false, role: null };
    }
    return {
      authorized: true,
      isMaster: false,
      role: (data.role as AuthorizedUserRole) || 'editor',
      displayName: String(data.nome || normalizedEmail),
    };
  } catch {
    return { authorized: false, isMaster: false, role: null };
  }
}

export async function checkIsAuthorizedAdmin(
  _uid?: string | null,
  email?: string | null,
  emailVerified?: boolean | null
): Promise<boolean> {
  const info = await getAdminAccessInfo(email, emailVerified);
  return info.authorized;
}

export async function compressImageToDataUrl(
  file: File,
  maxWidth = 1280,
  maxCharLength = 340000
): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Falha ao carregar imagem.'));
      image.src = objectUrl;
    });

    const scale = img.width > maxWidth ? maxWidth / img.width : 1;
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Contexto 2D indisponível.');
    ctx.drawImage(img, 0, 0, width, height);

    const qualities = [0.82, 0.7, 0.58, 0.45];
    for (const q of qualities) {
      const dataUrl = canvas.toDataURL('image/jpeg', q);
      if (dataUrl.length <= maxCharLength) {
        return dataUrl;
      }
    }

    throw new Error('A imagem excede o limite de tamanho mesmo após compressão.');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// ==========================================
// LEADS (COTAÇÕES)
// ==========================================

export async function createLeadInFirestore(quote: QuoteData): Promise<LeadRecord> {
  const leadId = sanitizeId(
    `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    'lead'
  );
  const path = `leads/${leadId}`;

  const payload = {
    nome: clampString(quote.nome, 120),
    telefone: clampString(quote.telefone, 30),
    email: clampString(quote.email, 150),
    tipoVeiculo: quote.tipoVeiculo,
    ano: clampString(quote.ano, 20),
    modelo: clampString(quote.modelo, 100),
    status: 'Novo' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'leads', leadId), payload);
    return {
      ...quote,
      id: leadId,
      timestamp: Date.now(),
      status: 'Novo',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeAdminLeads(
  onData: (leads: LeadRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: LeadRecord[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          nome: String(d.nome || ''),
          telefone: String(d.telefone || ''),
          email: String(d.email || ''),
          tipoVeiculo: (d.tipoVeiculo as LeadRecord['tipoVeiculo']) || 'Carro',
          ano: String(d.ano || ''),
          modelo: String(d.modelo || ''),
          status: (d.status as LeadRecord['status']) || 'Novo',
          timestamp: timestampToMs(d.createdAt),
        };
      });
      onData(items);
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'leads');
      }
    }
  );
}

export async function updateLeadStatusInFirestore(
  leadId: string,
  status: LeadRecord['status']
): Promise<void> {
  const safeId = sanitizeId(leadId, 'lead');
  try {
    await updateDoc(doc(db, 'leads', safeId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `leads/${safeId}`);
  }
}

export async function deleteLeadInFirestore(leadId: string): Promise<void> {
  const safeId = sanitizeId(leadId, 'lead');
  try {
    await deleteDoc(doc(db, 'leads', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `leads/${safeId}`);
  }
}

export async function clearAllLeadsInFirestore(leadIds: string[]): Promise<void> {
  if (leadIds.length === 0) return;
  try {
    const batch = writeBatch(db);
    for (const id of leadIds) {
      batch.delete(doc(db, 'leads', sanitizeId(id, 'lead')));
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'leads');
  }
}

// ==========================================
// CAROUSEL SLIDES (IMAGENS DO CARROSSEL)
// ==========================================

export function subscribeCarouselSlides(
  onData: (slides: CarouselSlide[], fromServerCount: number) => void
): Unsubscribe {
  const q = query(collection(db, 'carouselSlides'), orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(DEFAULT_CAROUSEL_SLIDES, 0);
        return;
      }
      const items: CarouselSlide[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          imageUrl: String(d.imageUrl || ''),
          kicker: String(d.kicker || ''),
          title: String(d.title || ''),
          description: String(d.description || ''),
          textAlign: d.textAlign === 'center' ? 'center' : 'left',
        };
      });
      onData(items, snapshot.size);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'carouselSlides');
    }
  );
}

export async function seedDefaultCarouselSlidesIfEmpty(): Promise<CarouselSlide[]> {
  try {
    const existingSnap = await getDocs(collection(db, 'carouselSlides'));
    if (!existingSnap.empty) {
      return existingSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<CarouselSlide, 'id'> & { order?: number }) }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(({ id, imageUrl, kicker, title, description, textAlign }) => ({
          id,
          imageUrl,
          kicker,
          title,
          description,
          textAlign: textAlign === 'center' ? 'center' : 'left',
        }));
    }

    const batch = writeBatch(db);
    DEFAULT_CAROUSEL_SLIDES.forEach((slide, index) => {
      const safeId = sanitizeId(slide.id, 'slide');
      batch.set(doc(db, 'carouselSlides', safeId), {
        imageUrl: clampString(slide.imageUrl, 350000),
        kicker: clampString(slide.kicker, 80),
        title: clampString(slide.title, 160),
        description: clampString(slide.description, 400),
        textAlign: slide.textAlign === 'center' ? 'center' : 'left',
        order: index,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    return DEFAULT_CAROUSEL_SLIDES;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'carouselSlides');
  }
}

export async function saveCarouselSlideInFirestore(
  slide: CarouselSlide,
  order: number,
  isNew: boolean
): Promise<void> {
  const safeId = sanitizeId(slide.id, 'slide');
  const path = `carouselSlides/${safeId}`;
  const baseData = {
    imageUrl: clampString(slide.imageUrl, 350000),
    kicker: clampString(slide.kicker || '', 80),
    title: clampString(slide.title || 'Proteção Center Auto', 160),
    description: clampString(slide.description || '', 400),
    textAlign: slide.textAlign === 'center' ? ('center' as const) : ('left' as const),
    order: Math.max(0, Math.min(1000, Math.trunc(order))),
    updatedAt: serverTimestamp(),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'carouselSlides', safeId), {
        ...baseData,
        createdAt: serverTimestamp(),
      });
    } else {
      const existingDoc = await getDoc(doc(db, 'carouselSlides', safeId));
      if (existingDoc.exists()) {
        await updateDoc(doc(db, 'carouselSlides', safeId), baseData);
      } else {
        await setDoc(doc(db, 'carouselSlides', safeId), {
          ...baseData,
          createdAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function syncAllCarouselSlidesToFirestore(slides: CarouselSlide[]): Promise<void> {
  try {
    const existingSnap = await getDocs(collection(db, 'carouselSlides'));
    const existingIds = new Set(existingSnap.docs.map((d) => d.id));
    const desiredIds = new Set(slides.map((s) => sanitizeId(s.id, 'slide')));

    const batch = writeBatch(db);

    for (const oldId of existingIds) {
      if (!desiredIds.has(oldId)) {
        batch.delete(doc(db, 'carouselSlides', oldId));
      }
    }

    slides.forEach((slide, index) => {
      const safeId = sanitizeId(slide.id, 'slide');
      const baseData = {
        imageUrl: clampString(slide.imageUrl, 350000),
        kicker: clampString(slide.kicker || '', 80),
        title: clampString(slide.title || 'Proteção Center Auto', 160),
        description: clampString(slide.description || '', 400),
        textAlign: slide.textAlign === 'center' ? ('center' as const) : ('left' as const),
        order: Math.max(0, Math.min(1000, index)),
        updatedAt: serverTimestamp(),
      };

      if (existingIds.has(safeId)) {
        batch.update(doc(db, 'carouselSlides', safeId), baseData);
      } else {
        batch.set(doc(db, 'carouselSlides', safeId), {
          ...baseData,
          createdAt: serverTimestamp(),
        });
      }
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'carouselSlides');
  }
}

export async function deleteCarouselSlideInFirestore(slideId: string): Promise<void> {
  const safeId = sanitizeId(slideId, 'slide');
  try {
    await deleteDoc(doc(db, 'carouselSlides', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `carouselSlides/${safeId}`);
  }
}

// ==========================================
// CAROUSEL VIDEOS (VÍDEOS)
// ==========================================

export function subscribeCarouselVideos(
  onData: (videos: CarouselVideo[], fromServerCount: number) => void
): Unsubscribe {
  const q = query(collection(db, 'carouselVideos'), orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(DEFAULT_CAROUSEL_VIDEO_ITEMS, 0);
        return;
      }
      const items: CarouselVideo[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          src: String(d.src || ''),
          title: String(d.title || ''),
          description: String(d.description || ''),
        };
      });
      onData(items, snapshot.size);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'carouselVideos');
    }
  );
}

export async function seedDefaultCarouselVideosIfEmpty(): Promise<CarouselVideo[]> {
  try {
    const existingSnap = await getDocs(collection(db, 'carouselVideos'));
    if (!existingSnap.empty) {
      return existingSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<CarouselVideo, 'id'> & { order?: number }) }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map(({ id, src, title, description }) => ({
          id,
          src,
          title,
          description,
        }));
    }

    const batch = writeBatch(db);
    DEFAULT_CAROUSEL_VIDEO_ITEMS.forEach((video, index) => {
      const safeId = sanitizeId(video.id, 'video');
      batch.set(doc(db, 'carouselVideos', safeId), {
        src: clampString(video.src, 2048),
        title: clampString(video.title, 160),
        description: clampString(video.description, 400),
        order: index,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
    return DEFAULT_CAROUSEL_VIDEO_ITEMS;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'carouselVideos');
  }
}

export async function syncAllCarouselVideosToFirestore(videos: CarouselVideo[]): Promise<void> {
  try {
    const existingSnap = await getDocs(collection(db, 'carouselVideos'));
    const existingIds = new Set(existingSnap.docs.map((d) => d.id));
    const desiredIds = new Set(videos.map((v) => sanitizeId(v.id, 'video')));

    const batch = writeBatch(db);

    for (const oldId of existingIds) {
      if (!desiredIds.has(oldId)) {
        batch.delete(doc(db, 'carouselVideos', oldId));
      }
    }

    videos.forEach((video, index) => {
      const safeId = sanitizeId(video.id, 'video');
      const baseData = {
        src: clampString(video.src, 2048),
        title: clampString(video.title || `Vídeo ${index + 1}`, 160),
        description: clampString(video.description || '', 400),
        order: Math.max(0, Math.min(1000, index)),
        updatedAt: serverTimestamp(),
      };

      if (existingIds.has(safeId)) {
        batch.update(doc(db, 'carouselVideos', safeId), baseData);
      } else {
        batch.set(doc(db, 'carouselVideos', safeId), {
          ...baseData,
          createdAt: serverTimestamp(),
        });
      }
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'carouselVideos');
  }
}

// ==========================================
// TESTIMONIALS (AVALIAÇÕES COM MODERAÇÃO)
// ==========================================

export function subscribeApprovedTestimonials(
  onData: (items: CustomerTestimonial[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'testimonials'),
    where('status', '==', 'approved')
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: CustomerTestimonial[] = snapshot.docs
        .map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            name: String(d.name || ''),
            city: String(d.city || ''),
            vehicle: String(d.vehicle || ''),
            category: (d.category as CustomerTestimonial['category']) || 'assistencia',
            rating: Number(d.rating) || 5,
            quote: String(d.quote || ''),
            photo: d.photo ? String(d.photo) : undefined,
            createdAt: timestampToMs(d.createdAt),
            status: (d.status as TestimonialStatus) || 'approved',
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt);
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'testimonials');
    }
  );
}

export function subscribeAllTestimonials(
  onData: (items: CustomerTestimonial[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, 'testimonials'),
    (snapshot) => {
      const items: CustomerTestimonial[] = snapshot.docs
        .map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            name: String(d.name || ''),
            city: String(d.city || ''),
            vehicle: String(d.vehicle || ''),
            category: (d.category as CustomerTestimonial['category']) || 'assistencia',
            rating: Number(d.rating) || 5,
            quote: String(d.quote || ''),
            photo: d.photo ? String(d.photo) : undefined,
            createdAt: timestampToMs(d.createdAt),
            status: (d.status as TestimonialStatus) || 'pending',
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt);
      onData(items);
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'testimonials');
      }
    }
  );
}

export async function submitTestimonialToFirestore(
  input: Omit<CustomerTestimonial, 'id' | 'createdAt' | 'status'>
): Promise<CustomerTestimonial> {
  const safeId = sanitizeId(
    `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    'rev'
  );
  const path = `testimonials/${safeId}`;

  const payload = {
    name: clampString(input.name, 60),
    city: clampString(input.city, 50),
    vehicle: clampString(input.vehicle, 50),
    category: input.category,
    rating: Math.max(1, Math.min(5, Math.trunc(input.rating))),
    quote: clampString(input.quote, 400),
    photo: input.photo ? clampString(input.photo, 350000) : '',
    status: 'pending' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'testimonials', safeId), payload);
    return {
      ...input,
      id: safeId,
      createdAt: Date.now(),
      status: 'pending',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTestimonialStatusInFirestore(
  id: string,
  status: TestimonialStatus
): Promise<void> {
  const safeId = sanitizeId(id, 'rev');
  try {
    await updateDoc(doc(db, 'testimonials', safeId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `testimonials/${safeId}`);
  }
}

export async function deleteTestimonialInFirestore(id: string): Promise<void> {
  const safeId = sanitizeId(id, 'rev');
  try {
    await deleteDoc(doc(db, 'testimonials', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `testimonials/${safeId}`);
  }
}

// ==========================================
// AUTHORIZED USERS (USUÁRIOS COM ACESSO À EDIÇÃO DO SITE)
// ==========================================

function normalizeAuthorizedEmail(rawEmail: string): string {
  const cleaned = clampString(rawEmail, 150).toLowerCase();
  if (cleaned.length < 5 || !EMAIL_ID_REGEX.test(cleaned)) {
    throw new Error('Informe um e-mail Google válido (ex.: nome@gmail.com).');
  }
  return cleaned;
}

export function subscribeAuthorizedUsers(
  onData: (users: AuthorizedUser[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'authorizedUsers'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: AuthorizedUser[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          email: String(d.email || docSnap.id),
          nome: String(d.nome || ''),
          role: (d.role as AuthorizedUserRole) || 'editor',
          status: (d.status as AuthorizedUserStatus) || 'Ativo',
          observacoes: String(d.observacoes || ''),
          createdBy: String(d.createdBy || ALLOWED_ADMIN_EMAIL),
          createdAt: timestampToMs(d.createdAt),
          updatedAt: timestampToMs(d.updatedAt),
        };
      });
      onData(items);
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'authorizedUsers');
      }
    }
  );
}

export async function saveAuthorizedUserInFirestore(
  input: {
    nome: string;
    email: string;
    role: AuthorizedUserRole;
    status: AuthorizedUserStatus;
    observacoes: string;
    createdByEmail: string;
  },
  isNew: boolean
): Promise<string> {
  const emailKey = normalizeAuthorizedEmail(input.email);
  const safeName = clampString(input.nome, 120);
  if (safeName.length < 2) {
    throw new Error('O nome completo deve ter pelo menos 2 caracteres.');
  }
  const safeNotes = clampString(input.observacoes || '', 300);
  const safeCreator = normalizeAuthorizedEmail(input.createdByEmail || ALLOWED_ADMIN_EMAIL);
  const docRef = doc(db, 'authorizedUsers', emailKey);
  const path = `authorizedUsers/${emailKey}`;

  try {
    if (isNew) {
      const existingSnap = await getDoc(docRef);
      if (existingSnap.exists()) {
        await updateDoc(docRef, {
          nome: safeName,
          role: input.role,
          status: input.status,
          observacoes: safeNotes,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(docRef, {
          nome: safeName,
          email: emailKey,
          role: input.role,
          status: input.status,
          observacoes: safeNotes,
          createdBy: safeCreator,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } else {
      await updateDoc(docRef, {
        nome: safeName,
        role: input.role,
        status: input.status,
        observacoes: safeNotes,
        updatedAt: serverTimestamp(),
      });
    }
    return emailKey;
  } catch (error) {
    handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
  }
}

export async function deleteAuthorizedUserInFirestore(email: string): Promise<void> {
  const emailKey = normalizeAuthorizedEmail(email);
  try {
    await deleteDoc(doc(db, 'authorizedUsers', emailKey));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `authorizedUsers/${emailKey}`);
  }
}


