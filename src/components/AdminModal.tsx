import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Image as ImageIcon,
  Film,
  Users,
  FileSpreadsheet,
  Trash2,
  Plus,
  AlertTriangle,
  Download,
  ExternalLink,
  Play,
  Pencil,
  Save,
  Type,
  AlignLeft,
  AlignCenter,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Upload,
  Loader2,
  Star,
  Clock,
  XCircle,
  MessageSquareQuote,
} from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import {
  ALLOWED_ADMIN_EMAIL,
  parseVideoSource,
  exportLeadsToCSV,
} from '../utils/storage';
import {
  getAdminAccessInfo,
  compressImageToDataUrl,
  subscribeAdminLeads,
  updateLeadStatusInFirestore,
  deleteLeadInFirestore,
  clearAllLeadsInFirestore,
  subscribeCarouselSlides,
  seedDefaultCarouselSlidesIfEmpty,
  syncAllCarouselSlidesToFirestore,
  subscribeCarouselVideos,
  seedDefaultCarouselVideosIfEmpty,
  syncAllCarouselVideosToFirestore,
  subscribeAllTestimonials,
  updateTestimonialStatusInFirestore,
  deleteTestimonialInFirestore,
  subscribeAuthorizedUsers,
  saveAuthorizedUserInFirestore,
  deleteAuthorizedUserInFirestore,
} from '../utils/firestoreDb';
import { saveMediaFile, deleteMediaFile, isIndexedDbMediaRef } from '../utils/mediaDb';
import { MediaImage, MediaVideoPlayer } from './MediaRenderer';
import {
  LeadRecord,
  CarouselSlide,
  CarouselVideo,
  CustomerTestimonial,
  TestimonialStatus,
  AuthorizedUser,
  AuthorizedUserRole,
  AuthorizedUserStatus,
} from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSlidesUpdate: (slides: CarouselSlide[]) => void;
  onVideosUpdate: (videos: CarouselVideo[]) => void;
  onTestimonialsUpdate: (items: CustomerTestimonial[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onSlidesUpdate,
  onVideosUpdate,
  onTestimonialsUpdate,
}) => {
  // Auth states (Firebase Google Auth)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMasterSession, setIsMasterSession] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'carousel' | 'videos' | 'testimonials' | 'users' | 'leads'>('carousel');
  const [authError, setAuthError] = useState('');

  // Carousel slides & text editor
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newKicker, setNewKicker] = useState('Associação de Benefícios');
  const [newTitle, setNewTitle] = useState('Proteção completa para seu veículo');
  const [newDesc, setNewDesc] = useState('Assistência 24h em todo o Brasil e condutor livre.');

  // Slide Text Editor state
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editKicker, setEditKicker] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAlign, setEditAlign] = useState<'left' | 'center'>('left');

  // Carousel videos
  const [videos, setVideos] = useState<CarouselVideo[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [targetVideoPosition, setTargetVideoPosition] = useState<string>('0');
  const [videoFeedback, setVideoFeedback] = useState<{ type: 'loading' | 'success' | 'error'; text: string } | null>(null);
  const [slideFeedback, setSlideFeedback] = useState<{ type: 'loading' | 'success' | 'error'; text: string } | null>(null);

  // Authorized site-editor users database state
  const [usersList, setUsersList] = useState<AuthorizedUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [editingUserEmail, setEditingUserEmail] = useState<string | null>(null);
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormRole, setUserFormRole] = useState<AuthorizedUserRole>('editor');
  const [userFormStatus, setUserFormStatus] = useState<AuthorizedUserStatus>('Ativo');
  const [userFormNotes, setUserFormNotes] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userMsg, setUserMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Leads
  const [leads, setLeads] = useState<LeadRecord[]>([]);

  // User-submitted testimonials moderation
  const [testimonials, setTestimonials] = useState<CustomerTestimonial[]>([]);
  const [testimonialFilter, setTestimonialFilter] = useState<'all' | TestimonialStatus>('all');

  useEffect(() => {
    if (!isOpen) {
      setAuthError('');
      setVideoFeedback(null);
      setSlideFeedback(null);
      setUserMsg(null);
      return;
    }

    setIsCheckingAuth(true);
    let unsubLeads: (() => void) | null = null;
    let unsubSlides: (() => void) | null = null;
    let unsubVideos: (() => void) | null = null;
    let unsubTestimonials: (() => void) | null = null;
    let unsubUsers: (() => void) | null = null;

    const clearSubscriptions = () => {
      unsubLeads?.();
      unsubSlides?.();
      unsubVideos?.();
      unsubTestimonials?.();
      unsubUsers?.();
      unsubLeads = null;
      unsubSlides = null;
      unsubVideos = null;
      unsubTestimonials = null;
      unsubUsers = null;
    };

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      clearSubscriptions();

      if (!firebaseUser) {
        setIsLoggedIn(false);
        setIsMasterSession(false);
        setAdminEmail('');
        setIsCheckingAuth(false);
        return;
      }

      const access = await getAdminAccessInfo(
        firebaseUser.email,
        firebaseUser.emailVerified
      );

      if (!access.authorized) {
        setAuthError(
          `Acesso negado: a conta ${firebaseUser.email || 'selecionada'} não está cadastrada ou ativa para editar o site.`
        );
        setIsLoggedIn(false);
        setIsMasterSession(false);
        setAdminEmail('');
        setIsCheckingAuth(false);
        await signOut(auth);
        return;
      }

      setIsLoggedIn(true);
      setIsMasterSession(access.isMaster);
      setAdminEmail(firebaseUser.email || ALLOWED_ADMIN_EMAIL);
      setAuthError('');
      setIsCheckingAuth(false);

      if (!access.isMaster) {
        setActiveTab((prev) => (prev === 'carousel' || prev === 'videos' ? prev : 'carousel'));
      }

      // Ensure default slides and videos are seeded in Firestore
      void seedDefaultCarouselSlidesIfEmpty();
      void seedDefaultCarouselVideosIfEmpty();

      unsubSlides = subscribeCarouselSlides((items) => {
        setSlides(items);
      });
      unsubVideos = subscribeCarouselVideos((items) => {
        setVideos(items);
        setTargetVideoPosition((prev) =>
          prev === 'new' || items.length === 0 ? (items.length > 0 ? '0' : 'new') : prev
        );
      });

      if (access.isMaster) {
        unsubLeads = subscribeAdminLeads((items) => {
          setLeads(items);
        });
        unsubTestimonials = subscribeAllTestimonials((items) => {
          setTestimonials(items);
        });
        unsubUsers = subscribeAuthorizedUsers((items) => {
          setUsersList(items);
        });
      }
    });

    return () => {
      unsubAuth();
      clearSubscriptions();
    };
  }, [isOpen]);

  // Save all adjustments to Firestore and close
  const handleSaveAndExit = async () => {
    try {
      await Promise.all([
        syncAllCarouselSlidesToFirestore(slides),
        syncAllCarouselVideosToFirestore(videos),
      ]);
      onSlidesUpdate(slides);
      onVideosUpdate(videos);
      setEditingSlideId(null);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar no Firestore:', err);
      setAuthError('Erro ao salvar alterações no banco de dados.');
    }
  };

  // Sign out of Firebase admin account and close
  const handleSignOutAndClose = async () => {
    setEditingSlideId(null);
    setAuthError('');
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setIsLoggedIn(false);
    setAdminEmail('');
    onClose();
  };

  // Close modal without signing out
  const handleCloseWithoutSaving = () => {
    setAuthError('');
    setEditingSlideId(null);
    onClose();
  };

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setAuthError('');
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Erro no login Google:', err);
      setAuthError('Não foi possível concluir o login com o Google. Verifique se pop-ups estão liberados.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // SLIDE TEXT EDITOR HANDLERS
  const handleOpenTextEditor = (slide: CarouselSlide) => {
    setEditingSlideId(slide.id);
    setEditKicker(slide.kicker || 'Associação de Benefícios');
    setEditTitle(slide.title || '');
    setEditDesc(slide.description || '');
    setEditAlign(slide.textAlign || 'left');
  };

  const handleSaveSlideText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlideId) return;

    const updated = slides.map((s) => {
      if (s.id === editingSlideId) {
        return {
          ...s,
          kicker: editKicker.trim(),
          title: editTitle.trim(),
          description: editDesc.trim(),
          textAlign: editAlign,
        };
      }
      return s;
    });

    setSlides(updated);
    onSlidesUpdate(updated);
    setEditingSlideId(null);
    try {
      await syncAllCarouselSlidesToFirestore(updated);
      setSlideFeedback({ type: 'success', text: 'Textos do slide salvos no banco de dados!' });
    } catch {
      setSlideFeedback({ type: 'error', text: 'Erro ao salvar textos do slide no banco.' });
    }
  };

  const handleCancelSlideText = () => {
    setEditingSlideId(null);
  };

  // ADD NEW SLIDE VIA URL
  const handleAddSlideUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    const newSlide: CarouselSlide = {
      id: `slide_${Date.now()}`,
      imageUrl: newImageUrl.trim(),
      kicker: newKicker.trim() || 'Associação de Benefícios',
      title: newTitle.trim() || 'Nova Foto do Carrossel',
      description: newDesc.trim() || 'Proteção completa e assistência 24h.',
      textAlign: 'left',
    };

    const updated = [...slides, newSlide];
    setSlides(updated);
    onSlidesUpdate(updated);
    setNewImageUrl('');
    try {
      await syncAllCarouselSlidesToFirestore(updated);
      setSlideFeedback({ type: 'success', text: 'Foto adicionada e salva no banco de dados!' });
    } catch {
      setSlideFeedback({ type: 'error', text: 'Erro ao salvar foto no banco de dados.' });
    }
  };

  // ADD NEW SLIDE VIA FILE UPLOAD (compressed to JPEG data URL for cross-device Firestore storage)
  const handleSlideFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSlideFeedback({ type: 'loading', text: `Otimizando e salvando "${file.name}" no banco...` });

    try {
      const compressedUrl = await compressImageToDataUrl(file, 1280, 340000);
      const newSlide: CarouselSlide = {
        id: `slide_${Date.now()}`,
        imageUrl: compressedUrl,
        kicker: newKicker.trim() || 'Associação de Benefícios',
        title: newTitle.trim() || 'Nova Foto do Carrossel',
        description: newDesc.trim() || 'Proteção completa e assistência 24h.',
        textAlign: 'left',
      };

      const updated = [...slides, newSlide];
      await syncAllCarouselSlidesToFirestore(updated);
      setSlides(updated);
      onSlidesUpdate(updated);
      setSlideFeedback({ type: 'success', text: `Imagem "${file.name}" salva no banco de dados!` });
    } catch (err) {
      console.error('Erro ao fazer upload de imagem:', err);
      setSlideFeedback({
        type: 'error',
        text: 'Erro ao salvar a imagem selecionada. Tente uma imagem menor ou use URL.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleDeleteSlide = async (id: string) => {
    const target = slides.find((s) => s.id === id);
    if (target && isIndexedDbMediaRef(target.imageUrl)) {
      void deleteMediaFile(target.imageUrl);
    }

    const updated = slides.filter((s) => s.id !== id);
    setSlides(updated);
    onSlidesUpdate(updated);
    if (editingSlideId === id) {
      setEditingSlideId(null);
    }
    try {
      await syncAllCarouselSlidesToFirestore(updated);
    } catch {
      setSlideFeedback({ type: 'error', text: 'Erro ao remover slide do banco de dados.' });
    }
  };

  // VIDEOS HANDLERS
  const applyVideoSourceAtPosition = (newSrc: string, positionValue: string): { updated: CarouselVideo[]; posLabel: string } => {
    if (positionValue === 'new' || videos.length === 0) {
      const nextNum = videos.length + 1;
      const newItem: CarouselVideo = {
        id: `video_${Date.now()}`,
        src: newSrc,
        title: `0${nextNum}. Novo Vídeo Center Auto`,
        description: 'Conteúdo informativo Center Auto Proteção Veicular.',
      };
      return {
        updated: [...videos, newItem],
        posLabel: `Posição #${nextNum}`,
      };
    }

    const idx = Math.max(0, Math.min(videos.length - 1, parseInt(positionValue, 10) || 0));
    const oldSrc = videos[idx]?.src;
    if (oldSrc && oldSrc !== newSrc && isIndexedDbMediaRef(oldSrc)) {
      void deleteMediaFile(oldSrc);
    }

    const updated = videos.map((item, i) =>
      i === idx
        ? {
            ...item,
            src: newSrc,
          }
        : item
    );

    return {
      updated,
      posLabel: `Posição #${idx + 1}`,
    };
  };

  const handleAddVideoUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) return;

    const { updated, posLabel } = applyVideoSourceAtPosition(newVideoUrl.trim(), targetVideoPosition);
    try {
      await syncAllCarouselVideosToFirestore(updated);
      setVideos(updated);
      onVideosUpdate(updated);
      setNewVideoUrl('');
      setVideoFeedback({
        type: 'success',
        text: `Vídeo salvo na ${posLabel} no banco de dados!`,
      });
    } catch {
      setVideoFeedback({ type: 'error', text: 'Não foi possível salvar o link do vídeo no banco.' });
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFeedback({ type: 'loading', text: `Salvando vídeo "${file.name}"...` });

    try {
      const mediaRef = await saveMediaFile(file);
      const { updated, posLabel } = applyVideoSourceAtPosition(mediaRef, targetVideoPosition);
      await syncAllCarouselVideosToFirestore(updated);
      setVideos(updated);
      onVideosUpdate(updated);
      setVideoFeedback({
        type: 'success',
        text: `Vídeo "${file.name}" salvo na ${posLabel}. Para exibir em outros dispositivos, prefira links do YouTube/Vimeo.`,
      });
    } catch (err) {
      console.error('Erro ao salvar vídeo:', err);
      setVideoFeedback({
        type: 'error',
        text: 'Não foi possível salvar o vídeo selecionado. Verifique o espaço disponível.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleReplaceCardVideoFile = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFeedback({
      type: 'loading',
      text: `Substituindo vídeo da Posição #${index + 1} por "${file.name}"...`,
    });

    try {
      const mediaRef = await saveMediaFile(file);
      const { updated } = applyVideoSourceAtPosition(mediaRef, String(index));
      await syncAllCarouselVideosToFirestore(updated);
      setVideos(updated);
      onVideosUpdate(updated);
      setVideoFeedback({
        type: 'success',
        text: `Posição #${index + 1} substituída por "${file.name}" com sucesso!`,
      });
    } catch (err) {
      console.error('Erro ao substituir vídeo:', err);
      setVideoFeedback({
        type: 'error',
        text: 'Não foi possível substituir o vídeo desta posição.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleVideoFieldChange = (
    index: number,
    field: 'title' | 'description' | 'src',
    value: string
  ) => {
    setVideos((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveVideoItemText = async (index: number, silent = false) => {
    try {
      await syncAllCarouselVideosToFirestore(videos);
      onVideosUpdate(videos);
      if (!silent) {
        setVideoFeedback({
          type: 'success',
          text: `Texto e dados da Posição #${index + 1} salvos no banco de dados!`,
        });
      }
    } catch {
      if (!silent) {
        setVideoFeedback({ type: 'error', text: 'Não foi possível salvar as alterações do vídeo.' });
      }
    }
  };

  const handleMoveVideo = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= videos.length) return;

    const updated = [...videos];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);

    setVideos(updated);
    onVideosUpdate(updated);
    try {
      await syncAllCarouselVideosToFirestore(updated);
      setVideoFeedback({
        type: 'success',
        text: `Vídeo movido para a Posição #${targetIdx + 1}!`,
      });
    } catch {
      setVideoFeedback({ type: 'error', text: 'Erro ao reordenar vídeo no banco.' });
    }
  };

  const handleDeleteVideo = async (index: number) => {
    const target = videos[index];
    if (target?.src && isIndexedDbMediaRef(target.src)) {
      void deleteMediaFile(target.src);
    }

    const updated = videos.filter((_, idx) => idx !== index);
    setVideos(updated);
    onVideosUpdate(updated);
    if (targetVideoPosition !== 'new') {
      const currentIdx = parseInt(targetVideoPosition, 10);
      if (currentIdx >= updated.length) {
        setTargetVideoPosition(updated.length > 0 ? '0' : 'new');
      }
    }
    setVideoFeedback(null);
    try {
      await syncAllCarouselVideosToFirestore(updated);
    } catch {
      setVideoFeedback({ type: 'error', text: 'Erro ao remover vídeo do banco de dados.' });
    }
  };

  const resetUserForm = () => {
    setEditingUserEmail(null);
    setUserFormName('');
    setUserFormEmail('');
    setUserFormRole('editor');
    setUserFormStatus('Ativo');
    setUserFormNotes('');
  };

  const handleEditUser = (u: AuthorizedUser) => {
    setEditingUserEmail(u.email);
    setUserFormName(u.nome);
    setUserFormEmail(u.email);
    setUserFormRole(u.role);
    setUserFormStatus(u.status);
    setUserFormNotes(u.observacoes);
    setUserMsg(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg(null);

    const cleanName = userFormName.trim();
    const cleanEmail = userFormEmail.trim().toLowerCase();

    if (cleanName.length < 2) {
      setUserMsg({ type: 'error', text: 'Informe o nome completo (mínimo 2 caracteres).' });
      return;
    }
    if (cleanEmail.length < 5 || !cleanEmail.includes('@')) {
      setUserMsg({ type: 'error', text: 'Informe um e-mail Google válido.' });
      return;
    }
    if (cleanEmail === ALLOWED_ADMIN_EMAIL.toLowerCase()) {
      setUserMsg({
        type: 'error',
        text: 'O e-mail do Administrador Master já possui acesso permanente.',
      });
      return;
    }

    setIsSavingUser(true);
    try {
      await saveAuthorizedUserInFirestore(
        {
          nome: cleanName,
          email: cleanEmail,
          role: userFormRole,
          status: userFormStatus,
          observacoes: userFormNotes.trim(),
          createdByEmail: adminEmail || ALLOWED_ADMIN_EMAIL,
        },
        !editingUserEmail
      );

      setUserMsg({
        type: 'success',
        text: editingUserEmail
          ? `Permissões de "${cleanName}" atualizadas no banco de dados!`
          : `Usuário "${cleanName}" (${cleanEmail}) cadastrado com acesso para editar o site!`,
      });
      resetUserForm();
    } catch (err) {
      console.error('Erro ao salvar usuário autorizado:', err);
      setUserMsg({
        type: 'error',
        text:
          err instanceof Error && err.message.includes('e-mail')
            ? err.message
            : 'Erro ao salvar usuário no Firestore. Verifique o e-mail informado.',
      });
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleToggleUserStatus = async (u: AuthorizedUser) => {
    const nextStatus: AuthorizedUserStatus = u.status === 'Ativo' ? 'Inativo' : 'Ativo';
    try {
      await saveAuthorizedUserInFirestore(
        {
          nome: u.nome,
          email: u.email,
          role: u.role,
          status: nextStatus,
          observacoes: u.observacoes,
          createdByEmail: adminEmail || ALLOWED_ADMIN_EMAIL,
        },
        false
      );
    } catch (err) {
      console.error('Erro ao alterar status do usuário:', err);
    }
  };

  const handleDeleteUser = async (u: AuthorizedUser) => {
    if (!window.confirm(`Deseja remover o acesso de edição de "${u.nome}" (${u.email})?`)) {
      return;
    }
    try {
      await deleteAuthorizedUserInFirestore(u.email);
      if (editingUserEmail === u.email) {
        resetUserForm();
      }
      setUserMsg({
        type: 'success',
        text: `Acesso de "${u.nome}" removido do banco de dados.`,
      });
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      setUserMsg({ type: 'error', text: 'Não foi possível excluir o usuário.' });
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: LeadRecord['status']) => {
    try {
      await updateLeadStatusInFirestore(leadId, status);
    } catch (err) {
      console.error('Erro ao atualizar status do lead:', err);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await deleteLeadInFirestore(leadId);
    } catch (err) {
      console.error('Erro ao excluir lead:', err);
    }
  };

  const handleClearLeads = async () => {
    if (window.confirm('Tem certeza de que deseja limpar todo o histórico de leads salvos no banco de dados?')) {
      try {
        await clearAllLeadsInFirestore(leads.map((l) => l.id));
      } catch (err) {
        console.error('Erro ao limpar leads:', err);
      }
    }
  };

  const handleModerateTestimonial = async (id: string, status: TestimonialStatus) => {
    try {
      await updateTestimonialStatusInFirestore(id, status);
    } catch (err) {
      console.error('Erro ao moderar avaliação:', err);
    }
  };

  const handleDeleteTestimonial = async (item: CustomerTestimonial) => {
    if (item.photo && isIndexedDbMediaRef(item.photo)) {
      void deleteMediaFile(item.photo);
    }
    try {
      await deleteTestimonialInFirestore(item.id);
    } catch (err) {
      console.error('Erro ao excluir avaliação:', err);
    }
  };

  const pendingTestimonialsCount = testimonials.filter((t) => t.status === 'pending').length;
  const filteredTestimonials =
    testimonialFilter === 'all'
      ? testimonials
      : testimonials.filter((t) => t.status === testimonialFilter);

  const editingSlide = slides.find((s) => s.id === editingSlideId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#0d1e38] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">Painel Administrativo</h3>
              <p className="text-[11px] text-slate-300">Editor de Textos do Carrossel e Mídias</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <button
                type="button"
                onClick={handleSaveAndExit}
                className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all border border-emerald-400/30"
                title="Salvar alterações e sair (bloqueia o painel)"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar e Sair</span>
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleCloseWithoutSaving}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Fechar painel"
              title="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {!isLoggedIn ? (
            <div className="max-w-md mx-auto space-y-5 animate-fadeIn">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-extrabold text-[#0d1e38]">
                  Acesso ao Painel do Site
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Entre com a conta Google do administrador master (<strong className="text-slate-700">{ALLOWED_ADMIN_EMAIL}</strong>) ou de um usuário cadastrado para editar o site.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{authError}</span>
                </div>
              )}

              {isCheckingAuth ? (
                <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                  <span>Verificando sessão autorizada...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Conectando com Google...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Entrar com Google</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            // Step 2: Dashboard Content
            <div>
              {/* Tab navigation */}
              <div className="flex flex-wrap border-b border-slate-200 mb-6 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('carousel')}
                  className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'carousel'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Editor de Fotos & Textos ({slides.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('videos')}
                  className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'videos'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  Vídeos ({videos.length})
                </button>

                {isMasterSession && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveTab('leads')}
                      className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'leads'
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Leads ({leads.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('testimonials')}
                      className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'testimonials'
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <MessageSquareQuote className="w-4 h-4" />
                      <span>
                        Avaliações ({testimonials.length}
                        {pendingTestimonialsCount > 0 ? ` · ${pendingTestimonialsCount} pendente${pendingTestimonialsCount > 1 ? 's' : ''}` : ''})
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('users')}
                      className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'users'
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Usuários ({usersList.length})
                    </button>
                  </>
                )}
              </div>

              {/* Tab 1: Carousel Slides & Text Editor */}
              {activeTab === 'carousel' && (
                <div className="space-y-6">
                  
                  {/* SLIDE TEXT EDITOR FORM (when a slide is being edited) */}
                  {editingSlide && (
                    <div className="p-5 rounded-2xl bg-orange-50/60 border-2 border-orange-400 shadow-md animate-fadeIn space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-orange-200">
                        <div className="flex items-center gap-2">
                          <Type className="w-5 h-5 text-orange-600" />
                          <h4 className="font-extrabold text-[#0d1e38] text-base">
                            Editor de Textos do Slide
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={handleCancelSlideText}
                          className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                        >
                          Cancelar
                        </button>
                      </div>

                      <form onSubmit={handleSaveSlideText} className="space-y-4">
                        {/* Live Preview Box */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Pré-visualização em Tempo Real:
                          </label>
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-inner">
                            <MediaImage
                              src={editingSlide.imageUrl}
                              alt="Slide preview"
                              className="w-full h-full object-cover"
                            />
                            <div
                              className={`absolute inset-0 bg-gradient-to-t from-[#0d1e38]/95 via-[#0d1e38]/40 to-black/20 flex items-end p-4 ${
                                editAlign === 'center' ? 'justify-center text-center' : 'justify-start text-left'
                              }`}
                            >
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block">
                                  {editKicker || 'Etiqueta Superior'}
                                </span>
                                <h4 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                                  {editTitle || 'Título Principal do Slide'}
                                </h4>
                                <p className="text-xs text-slate-300 line-clamp-2">
                                  {editDesc || 'Texto descritivo de apoio da imagem.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Text fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Etiqueta Superior (Kicker)
                            </label>
                            <input
                              type="text"
                              value={editKicker}
                              onChange={(e) => setEditKicker(e.target.value)}
                              placeholder="Ex: Associação de Benefícios"
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Alinhamento do Texto
                            </label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setEditAlign('left')}
                                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                                  editAlign === 'left'
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-white text-slate-700 border-slate-200'
                                }`}
                              >
                                <AlignLeft className="w-3.5 h-3.5" /> À Esquerda
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditAlign('center')}
                                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                                  editAlign === 'center'
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-white text-slate-700 border-slate-200'
                                }`}
                              >
                                <AlignCenter className="w-3.5 h-3.5" /> Centralizado
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Título Principal
                          </label>
                          <input
                            type="text"
                            required
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Ex: Proteção total para seu carro ou moto"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Texto Descritivo / Subtítulo
                          </label>
                          <textarea
                            rows={2}
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            placeholder="Ex: 100% Tabela FIPE, reboque até 600km e assistência 24h sem burocracia."
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleCancelSlideText}
                            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
                          >
                            <Save className="w-4 h-4" />
                            Salvar Textos do Slide
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* ADD NEW SLIDE SECTION */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Plus className="w-4 h-4 text-orange-500" />
                      Adicionar Nova Imagem com Textos ao Carrossel
                    </h4>

                    <form onSubmit={handleAddSlideUrl} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Link da Imagem (URL)
                        </label>
                        <input
                          type="url"
                          placeholder="Cole a URL da imagem (https://...)"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Etiqueta Superior
                          </label>
                          <input
                            type="text"
                            value={newKicker}
                            onChange={(e) => setNewKicker(e.target.value)}
                            placeholder="Associação de Benefícios"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Título do Slide
                          </label>
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Proteção completa para seu veículo"
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Descrição / Subtítulo
                        </label>
                        <input
                          type="text"
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          placeholder="Assistência 24h em todo o Brasil e condutor livre."
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={!newImageUrl.trim()}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                          Adicionar Slide via URL
                        </button>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Ou upload do computador:</span>
                          <label className="px-3 py-1.5 bg-white hover:bg-slate-100 rounded text-slate-700 cursor-pointer font-bold border border-slate-300">
                            Escolher Arquivo
                            <input
                              type="file"
                              accept="image/*"
                              disabled={slideFeedback?.type === 'loading'}
                              onChange={handleSlideFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {slideFeedback && (
                        <div
                          className={`p-2.5 rounded-lg text-xs border flex items-center gap-2 ${
                            slideFeedback.type === 'error'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : slideFeedback.type === 'success'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}
                        >
                          {slideFeedback.type === 'loading' ? (
                            <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                          ) : slideFeedback.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                          )}
                          <span>{slideFeedback.text}</span>
                        </div>
                      )}
                    </form>
                  </div>

                  {/* CURRENT SLIDES LIST WITH TEXT EDIT BUTTON */}
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3">
                      Fotos e Textos do Carrossel ({slides.length})
                    </h5>

                    <div className="space-y-3">
                      {slides.map((slide, idx) => (
                        <div
                          key={slide.id || idx}
                          className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                        >
                          {/* Thumbnail preview */}
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                              <MediaImage
                                src={slide.imageUrl}
                                alt={`Slide ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                  Slide #{idx + 1}
                                </span>
                                {slide.kicker && (
                                  <span className="text-[10px] font-bold text-orange-600 uppercase">
                                    {slide.kicker}
                                  </span>
                                )}
                              </div>
                              <h6 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                                {slide.title}
                              </h6>
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {slide.description}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenTextEditor(slide)}
                              className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Editar Textos
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSlide(slide.id)}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                              title="Excluir este slide"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Carousel Videos */}
              {activeTab === 'videos' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">
                        Substituir ou Adicionar Vídeo por Posição
                      </h4>
                      <p className="text-xs text-slate-500">
                        Escolha em qual posição da seção de vídeos do site deseja colocar o vídeo (Posição #1 a #{Math.max(4, videos.length)} ou nova posição), depois cole o link ou selecione o arquivo do computador.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Posição de Destino:
                      </label>
                      <select
                        value={targetVideoPosition}
                        onChange={(e) => setTargetVideoPosition(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {videos.map((v, i) => (
                          <option key={`${v.id}_${i}`} value={String(i)}>
                            Substituir Posição #{i + 1} ({v.title || `Vídeo 0${i + 1}`})
                          </option>
                        ))}
                        <option value="new">
                          + Adicionar como Nova Posição (#{videos.length + 1})
                        </option>
                      </select>
                    </div>

                    <form onSubmit={handleAddVideoUrl} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        placeholder="Ex: https://www.youtube.com/watch?v=... ou link direto .mp4"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="submit"
                        disabled={!newVideoUrl.trim()}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        {targetVideoPosition === 'new'
                          ? 'Adicionar Link'
                          : `Substituir Posição #${parseInt(targetVideoPosition, 10) + 1}`}
                      </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>Ou envie um arquivo de vídeo do computador para a posição selecionada:</span>
                      <label
                        className={`px-3 py-1.5 rounded font-bold border transition-colors inline-flex items-center gap-1.5 ${
                          videoFeedback?.type === 'loading'
                            ? 'bg-slate-200 text-slate-500 border-slate-300 cursor-wait'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 cursor-pointer'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {videoFeedback?.type === 'loading' ? 'Salvando vídeo...' : 'Escolher Vídeo'}
                        <input
                          type="file"
                          accept="video/*"
                          disabled={videoFeedback?.type === 'loading'}
                          onChange={handleVideoFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {videoFeedback && (
                      <div
                        className={`p-3 rounded-lg text-xs border flex items-center gap-2 ${
                          videoFeedback.type === 'error'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : videoFeedback.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {videoFeedback.type === 'loading' ? (
                          <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                        ) : videoFeedback.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{videoFeedback.text}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3">
                      Posições e Textos dos Vídeos ({videos.length})
                    </h5>

                    {videos.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500">
                          Nenhum vídeo cadastrado no momento. Adicione um link ou faça upload acima.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {videos.map((videoItem, idx) => {
                          const parsed = parseVideoSource(videoItem.src);
                          const isUpload =
                            isIndexedDbMediaRef(videoItem.src) ||
                            videoItem.src.startsWith('data:video');
                          return (
                            <div
                              key={`${videoItem.id}_${idx}`}
                              className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3"
                            >
                              {/* Top bar with exact position & move/replace/delete actions */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 border border-orange-200">
                                    Posição #{idx + 1}
                                  </span>
                                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                    {isUpload ? 'UPLOAD' : parsed.type.toUpperCase()}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveVideo(idx, -1)}
                                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-600 text-[11px] font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    title="Subir posição"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                    Subir
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === videos.length - 1}
                                    onClick={() => handleMoveVideo(idx, 1)}
                                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-slate-600 text-[11px] font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    title="Descer posição"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                    Descer
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteVideo(idx)}
                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                                    title={`Excluir vídeo da Posição #${idx + 1}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Video Preview + Text Edit Box */}
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                                {/* Video preview & quick file replace */}
                                <div className="sm:col-span-5 space-y-2">
                                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 bg-black">
                                    <MediaVideoPlayer
                                      src={videoItem.src}
                                      title={videoItem.title || `Preview ${idx + 1}`}
                                      previewOnly
                                    />
                                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center pointer-events-none">
                                      <div className="w-8 h-8 rounded-full bg-orange-500/90 text-white flex items-center justify-center">
                                        <Play className="w-3.5 h-3.5" />
                                      </div>
                                    </div>
                                  </div>

                                  <label className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 text-slate-700 border border-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                                    <Upload className="w-3.5 h-3.5" />
                                    <span>Substituir Vídeo #{idx + 1}</span>
                                    <input
                                      type="file"
                                      accept="video/*"
                                      disabled={videoFeedback?.type === 'loading'}
                                      onChange={(e) => handleReplaceCardVideoFile(idx, e)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>

                                {/* Caixa de Edição de Texto de Cada Vídeo */}
                                <div className="sm:col-span-7 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0d1e38]">
                                    <Type className="w-3.5 h-3.5 text-orange-600" />
                                    <span>Editar Texto do Vídeo #{idx + 1}</span>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                      Título do Vídeo
                                    </label>
                                    <input
                                      type="text"
                                      value={videoItem.title}
                                      onChange={(e) =>
                                        handleVideoFieldChange(idx, 'title', e.target.value)
                                      }
                                      onBlur={() => handleSaveVideoItemText(idx, true)}
                                      placeholder={`Ex: 0${idx + 1}. Título do vídeo`}
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                      Texto / Descrição do Vídeo
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={videoItem.description}
                                      onChange={(e) =>
                                        handleVideoFieldChange(idx, 'description', e.target.value)
                                      }
                                      onBlur={() => handleSaveVideoItemText(idx, true)}
                                      placeholder="Digite o texto explicativo deste vídeo..."
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                  </div>

                                  {!isUpload && (
                                    <div>
                                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                        Link do Vídeo (URL)
                                      </label>
                                      <input
                                        type="url"
                                        value={videoItem.src}
                                        onChange={(e) =>
                                          handleVideoFieldChange(idx, 'src', e.target.value)
                                        }
                                        onBlur={() => handleSaveVideoItemText(idx, true)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                                      />
                                    </div>
                                  )}

                                  <div className="flex justify-end pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveVideoItemText(idx)}
                                      className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                      Salvar Texto
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Leads Management */}
              {activeTab === 'leads' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Histórico de Cotações Recebidas ({leads.length})
                      </h4>
                      <p className="text-xs text-slate-500">
                        Leads armazenados em tempo real no banco de dados Firestore.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => exportLeadsToCSV(leads)}
                        disabled={leads.length === 0}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Exportar CSV
                      </button>
                      <button
                        type="button"
                        onClick={handleClearLeads}
                        disabled={leads.length === 0}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Limpar
                      </button>
                    </div>
                  </div>

                  {leads.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500">
                        Nenhuma cotação registrada ainda. As solicitações enviadas pelo formulário aparecerão aqui em tempo real.
                      </p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                          <tr>
                            <th className="p-3">Data</th>
                            <th className="p-3">Nome</th>
                            <th className="p-3">Contato</th>
                            <th className="p-3">Veículo</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-slate-50">
                              <td className="p-3 text-slate-500 font-mono whitespace-nowrap">
                                {new Date(lead.timestamp).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="p-3 font-semibold text-slate-900">{lead.nome}</td>
                              <td className="p-3 text-slate-700">
                                <div className="font-mono">{lead.telefone}</div>
                                <div className="text-[11px] text-slate-500">{lead.email}</div>
                              </td>
                              <td className="p-3 text-slate-600">
                                {lead.tipoVeiculo} - {lead.modelo} ({lead.ano})
                              </td>
                              <td className="p-3">
                                <select
                                  value={lead.status}
                                  onChange={(e) =>
                                    handleUpdateLeadStatus(
                                      lead.id,
                                      e.target.value as LeadRecord['status']
                                    )
                                  }
                                  aria-label={`Status do lead ${lead.nome}`}
                                  className="px-2 py-1 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                  <option value="Novo">Novo</option>
                                  <option value="Contatado">Contatado</option>
                                  <option value="Convertido">Convertido</option>
                                </select>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <a
                                    href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1 whitespace-nowrap"
                                  >
                                    WhatsApp <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLead(lead.id)}
                                    className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                    title="Excluir cotação"
                                    aria-label={`Excluir cotação de ${lead.nome}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Testimonials Moderation */}
              {activeTab === 'testimonials' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">
                        Moderação de Avaliações ({testimonials.length})
                      </h4>
                      <p className="text-xs text-slate-500">
                        Comentários enviados pelos visitantes só ficam visíveis no site após você aprovar e ativar.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {(
                        [
                          { id: 'all', label: 'Todos' },
                          { id: 'pending', label: 'Pendentes' },
                          { id: 'approved', label: 'Ativos' },
                          { id: 'rejected', label: 'Desativados' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setTestimonialFilter(opt.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            testimonialFilter === opt.id
                              ? 'bg-[#0d1e38] text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredTestimonials.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500">
                        Nenhuma avaliação de usuário encontrada neste filtro. Os novos comentários enviados pelo formulário do site aparecerão aqui para sua aprovação.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTestimonials.map((item) => {
                        const categoryText =
                          item.category === 'assistencia'
                            ? 'Assistência 24h'
                            : item.category === 'sinistro'
                            ? 'Colisão e Reparo'
                            : 'Economia e Adesão';

                        return (
                          <div
                            key={item.id}
                            className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0">
                                {item.photo ? (
                                  <MediaImage
                                    src={item.photo}
                                    alt={item.name}
                                    className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-11 h-11 rounded-full bg-[#0d1e38] text-orange-400 font-bold text-xs flex items-center justify-center shrink-0">
                                    {item.name
                                      .trim()
                                      .split(/\s+/)
                                      .slice(0, 2)
                                      .map((p) => p[0])
                                      .join('')
                                      .toUpperCase()}
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h5 className="font-bold text-sm text-slate-900">
                                      {item.name}
                                    </h5>
                                    <span className="text-xs text-slate-500">
                                      {item.city} · {item.vehicle} · {categoryText}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                                    <span className="inline-flex items-center gap-0.5 text-amber-500">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3.5 h-3.5 ${
                                            i < item.rating
                                              ? 'fill-amber-400 text-amber-400'
                                              : 'text-slate-300'
                                          }`}
                                        />
                                      ))}
                                      <span className="ml-1 font-bold text-slate-700 tabular-nums">
                                        {item.rating}/5
                                      </span>
                                    </span>

                                    <span className="text-slate-400 tabular-nums">
                                      {new Date(item.createdAt).toLocaleString('pt-BR')}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Status label with explicit icon */}
                              <div className="shrink-0">
                                {item.status === 'approved' && (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Ativo no Site
                                  </span>
                                )}
                                {item.status === 'pending' && (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    Aguardando Aprovação
                                  </span>
                                )}
                                {item.status === 'rejected' && (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                    <XCircle className="w-4 h-4 text-slate-500" />
                                    Desativado
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                              "{item.quote}"
                            </p>

                            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                              {item.status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleModerateTestimonial(item.id, 'approved')}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Aprovar e Ativar
                                </button>
                              )}

                              {item.status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleModerateTestimonial(item.id, 'rejected')}
                                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  {item.status === 'approved' ? 'Desativar' : 'Rejeitar'}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteTestimonial(item)}
                                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-red-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Excluir
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Authorized Site Editors Database Management */}
              {activeTab === 'users' && isMasterSession && (
                <div className="space-y-6">
                  {/* Form: Add / Edit Authorized Site Editor */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                          <Users className="w-4 h-4 text-orange-500" />
                          {editingUserEmail
                            ? 'Editar Usuário com Acesso à Edição'
                            : 'Cadastrar Usuário para Edição do Site'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Cadastre o e-mail Google de quem terá permissão para entrar no Painel Administrativo e editar fotos, textos e vídeos do site.
                        </p>
                      </div>
                      {editingUserEmail && (
                        <button
                          type="button"
                          onClick={resetUserForm}
                          className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Cancelar Edição
                        </button>
                      )}
                    </div>

                    {userMsg && (
                      <div
                        className={`p-3 rounded-lg text-xs border ${
                          userMsg.type === 'error'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {userMsg.text}
                      </div>
                    )}

                    <form onSubmit={handleSaveUser} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            required
                            minLength={2}
                            maxLength={120}
                            placeholder="Nome do editor ou operador"
                            value={userFormName}
                            onChange={(e) => setUserFormName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            E-mail Google Autorizado *
                          </label>
                          <input
                            type="email"
                            required
                            minLength={5}
                            maxLength={150}
                            disabled={Boolean(editingUserEmail)}
                            placeholder="editor@gmail.com"
                            value={userFormEmail}
                            onChange={(e) => setUserFormEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-slate-100 disabled:text-slate-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nível de Acesso
                          </label>
                          <select
                            value={userFormRole}
                            onChange={(e) => setUserFormRole(e.target.value as AuthorizedUserRole)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="editor">Editor do Site (Fotos e Vídeos)</option>
                            <option value="admin">Administrador de Conteúdo</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Status de Acesso
                          </label>
                          <select
                            value={userFormStatus}
                            onChange={(e) => setUserFormStatus(e.target.value as AuthorizedUserStatus)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="Ativo">Ativo (Liberado para editar)</option>
                            <option value="Inativo">Inativo (Acesso bloqueado)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Observações (Opcional)
                        </label>
                        <textarea
                          rows={2}
                          maxLength={300}
                          placeholder="Ex: Responsável pela atualização de campanhas e vídeos..."
                          value={userFormNotes}
                          onChange={(e) => setUserFormNotes(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        {editingUserEmail && (
                          <button
                            type="button"
                            onClick={resetUserForm}
                            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isSavingUser}
                          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                        >
                          {isSavingUser ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Salvando...</span>
                            </>
                          ) : editingUserEmail ? (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Salvar Alterações</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>Cadastrar Usuário Editor</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Authorized Users List */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                        Usuários Autorizados a Editar o Site ({usersList.length})
                      </h5>
                      <input
                        type="search"
                        placeholder="Buscar por nome ou e-mail..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full sm:w-64 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    {usersList.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-500">
                          Nenhum usuário editor cadastrado ainda.
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Adicione o e-mail Google acima para liberar acesso de edição do site a outros membros da equipe.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {usersList
                          .filter((u) => {
                            const term = userSearch.trim().toLowerCase();
                            if (!term) return true;
                            return (
                              u.nome.toLowerCase().includes(term) ||
                              u.email.toLowerCase().includes(term)
                            );
                          })
                          .map((u) => (
                            <div
                              key={u.email}
                              className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-full bg-[#0d1e38] text-orange-400 font-bold text-xs flex items-center justify-center shrink-0">
                                  {u.nome.slice(0, 2).toUpperCase()}
                                </div>

                                <div className="min-w-0 space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-bold text-sm text-slate-900">
                                      {u.nome}
                                    </span>
                                    <span className="text-[11px] font-bold uppercase text-slate-500">
                                      {u.role === 'admin' ? 'Administrador' : 'Editor'}
                                    </span>
                                    <span
                                      className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                                        u.status === 'Ativo'
                                          ? 'text-emerald-700'
                                          : 'text-red-700'
                                      }`}
                                    >
                                      {u.status === 'Ativo' ? (
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      ) : (
                                        <XCircle className="w-3.5 h-3.5" />
                                      )}
                                      {u.status}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-600 break-all">{u.email}</p>

                                  {u.observacoes && (
                                    <p className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
                                      {u.observacoes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleEditUser(u)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleUserStatus(u)}
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold cursor-pointer"
                                >
                                  {u.status === 'Ativo' ? 'Bloquear' : 'Ativar'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 cursor-pointer"
                                  title="Remover acesso"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Master Admin Security Info Card */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Controle de Acesso para Edição do Site
                    </h5>
                    <p className="text-xs text-slate-600">
                      Administrador Master: <strong className="text-slate-900">{ALLOWED_ADMIN_EMAIL}</strong>
                      {adminEmail && (
                        <span className="text-emerald-700 font-semibold ml-2">
                          (Conectado: {adminEmail})
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Apenas o e-mail listado acima e os usuários com status <strong>Ativo</strong> cadastrados em <code>/authorizedUsers</code> conseguem autenticar no painel e editar fotos e vídeos do site.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {isLoggedIn ? (
            <>
              <p className="text-xs text-slate-500 text-center sm:text-left">
                Conectado como <strong className="text-slate-700">{adminEmail}</strong>. As alterações são salvas no Firestore.
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleSignOutAndClose}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair da Conta
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndExit}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar e Fechar</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full text-right">
              <button
                type="button"
                onClick={handleCloseWithoutSaving}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Fechar Janela
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
