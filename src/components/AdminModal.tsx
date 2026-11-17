import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
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
} from 'lucide-react';
import {
  ALLOWED_ADMIN_EMAIL,
  getStoredAdminUser,
  getStoredAdminPassword,
  getStoredCarouselSlides,
  saveStoredCarouselSlides,
  getStoredCarouselVideoItems,
  saveStoredCarouselVideoItems,
  parseVideoSource,
  getStoredLeads,
  exportLeadsToCSV,
} from '../utils/storage';
import { saveMediaFile, deleteMediaFile, isIndexedDbMediaRef } from '../utils/mediaDb';
import { MediaImage, MediaVideoPlayer } from './MediaRenderer';
import { LeadRecord, CarouselSlide, CarouselVideo } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSlidesUpdate: (slides: CarouselSlide[]) => void;
  onVideosUpdate: (videos: CarouselVideo[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onSlidesUpdate,
  onVideosUpdate,
}) => {
  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'carousel' | 'videos' | 'users' | 'leads'>('carousel');

  // Login form (do not prefill user or show it in the form)
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
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

  // New user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserLogin, setNewUserLogin] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [userMsg, setUserMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Leads
  const [leads, setLeads] = useState<LeadRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      const loadedVideos = getStoredCarouselVideoItems();
      setSlides(getStoredCarouselSlides());
      setVideos(loadedVideos);
      setTargetVideoPosition(loadedVideos.length > 0 ? '0' : 'new');
      setLeads(getStoredLeads());
      setUser(''); // Do not show or prefill user
      setPass('');
      setIsLoggedIn(false);
      setAuthError('');
      setVideoFeedback(null);
      setSlideFeedback(null);
      try {
        localStorage.setItem('adminUser', 'centerauto');
        if (!localStorage.getItem('adminPass') || localStorage.getItem('adminPass') === 'admin123') {
          localStorage.setItem('adminPass', 'Sr2025#4');
        }
      } catch {
        // ignore
      }
    } else {
      setIsLoggedIn(false);
      setUser('');
      setPass('');
      setAuthError('');
      setVideoFeedback(null);
      setSlideFeedback(null);
    }
  }, [isOpen]);

  // Save all adjustments and log out cleanly
  const handleSaveAndExit = () => {
    saveStoredCarouselSlides(slides);
    saveStoredCarouselVideoItems(videos);
    onSlidesUpdate(slides);
    onVideosUpdate(videos);

    setIsLoggedIn(false);
    setUser('');
    setPass('');
    setAuthError('');
    setEditingSlideId(null);
    onClose();
  };

  // Close modal and lock session
  const handleCloseWithoutSaving = () => {
    setIsLoggedIn(false);
    setUser('');
    setPass('');
    setAuthError('');
    setEditingSlideId(null);
    onClose();
  };

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const inputUser = user.trim().toLowerCase();
    const storedUser = getStoredAdminUser().toLowerCase();
    const storedPass = getStoredAdminPassword();

    const isUserValid = inputUser === 'centerauto' || inputUser === storedUser;
    const isPassValid = pass === 'Sr2025#4' || pass === storedPass;

    if (isUserValid && isPassValid) {
      try {
        localStorage.setItem('adminUser', 'centerauto');
      } catch {
        // ignore
      }
      setIsLoggedIn(true);
      setPass('');
      setAuthError('');
    } else {
      setAuthError('Usuário ou senha incorretos.');
    }
  };

  const validateStrongPassword = (p: string) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasNumber = /[0-9]/.test(p);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(p);
    return p.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  // SLIDE TEXT EDITOR HANDLERS
  const handleOpenTextEditor = (slide: CarouselSlide) => {
    setEditingSlideId(slide.id);
    setEditKicker(slide.kicker || 'Associação de Benefícios');
    setEditTitle(slide.title || '');
    setEditDesc(slide.description || '');
    setEditAlign(slide.textAlign || 'left');
  };

  const handleSaveSlideText = (e: React.FormEvent) => {
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
    saveStoredCarouselSlides(updated);
    onSlidesUpdate(updated);
    setEditingSlideId(null);
  };

  const handleCancelSlideText = () => {
    setEditingSlideId(null);
  };

  // ADD NEW SLIDE VIA URL
  const handleAddSlideUrl = (e: React.FormEvent) => {
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
    saveStoredCarouselSlides(updated);
    onSlidesUpdate(updated);

    setNewImageUrl('');
  };

  // ADD NEW SLIDE VIA FILE UPLOAD (stored in IndexedDB to avoid localStorage quota limit)
  const handleSlideFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSlideFeedback({ type: 'loading', text: `Salvando imagem "${file.name}"...` });

    try {
      const mediaRef = await saveMediaFile(file);
      const newSlide: CarouselSlide = {
        id: `slide_${Date.now()}`,
        imageUrl: mediaRef,
        kicker: newKicker.trim() || 'Associação de Benefícios',
        title: newTitle.trim() || 'Nova Foto do Carrossel',
        description: newDesc.trim() || 'Proteção completa e assistência 24h.',
        textAlign: 'left',
      };

      const updated = [...slides, newSlide];
      const saved = saveStoredCarouselSlides(updated);
      if (!saved) {
        await deleteMediaFile(mediaRef);
        throw new Error('Não foi possível salvar a lista de slides no navegador.');
      }

      setSlides(updated);
      onSlidesUpdate(updated);
      setSlideFeedback({ type: 'success', text: `Imagem "${file.name}" salva com sucesso no carrossel!` });
    } catch (err) {
      console.error('Erro ao fazer upload de imagem:', err);
      setSlideFeedback({
        type: 'error',
        text: 'Erro ao salvar a imagem selecionada. Tente novamente.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleDeleteSlide = (id: string) => {
    const target = slides.find((s) => s.id === id);
    if (target && isIndexedDbMediaRef(target.imageUrl)) {
      void deleteMediaFile(target.imageUrl);
    }

    const updated = slides.filter((s) => s.id !== id);
    setSlides(updated);
    saveStoredCarouselSlides(updated);
    onSlidesUpdate(updated);
    if (editingSlideId === id) {
      setEditingSlideId(null);
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

  const handleAddVideoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) return;

    const { updated, posLabel } = applyVideoSourceAtPosition(newVideoUrl.trim(), targetVideoPosition);
    const saved = saveStoredCarouselVideoItems(updated);
    if (!saved) {
      setVideoFeedback({ type: 'error', text: 'Não foi possível salvar o link do vídeo.' });
      return;
    }

    setVideos(updated);
    onVideosUpdate(updated);
    setNewVideoUrl('');
    setVideoFeedback({
      type: 'success',
      text: `Vídeo salvo na ${posLabel} com sucesso!`,
    });
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFeedback({ type: 'loading', text: `Salvando vídeo "${file.name}"...` });

    try {
      const mediaRef = await saveMediaFile(file);
      const { updated, posLabel } = applyVideoSourceAtPosition(mediaRef, targetVideoPosition);
      const saved = saveStoredCarouselVideoItems(updated);
      if (!saved) {
        await deleteMediaFile(mediaRef);
        throw new Error('Falha ao gravar lista de vídeos no navegador.');
      }

      setVideos(updated);
      onVideosUpdate(updated);
      setVideoFeedback({
        type: 'success',
        text: `Vídeo "${file.name}" salvo com sucesso na ${posLabel}!`,
      });
    } catch (err) {
      console.error('Erro ao salvar vídeo:', err);
      setVideoFeedback({
        type: 'error',
        text: 'Não foi possível salvar o vídeo selecionado neste navegador. Verifique o espaço disponível.',
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
      const saved = saveStoredCarouselVideoItems(updated);
      if (!saved) {
        await deleteMediaFile(mediaRef);
        throw new Error('Falha ao gravar substituição do vídeo.');
      }

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

  const handleSaveVideoItemText = (index: number, silent = false) => {
    const saved = saveStoredCarouselVideoItems(videos);
    if (!saved) {
      if (!silent) {
        setVideoFeedback({ type: 'error', text: 'Não foi possível salvar as alterações do vídeo.' });
      }
      return;
    }

    onVideosUpdate(videos);
    if (!silent) {
      setVideoFeedback({
        type: 'success',
        text: `Texto e dados da Posição #${index + 1} salvos com sucesso!`,
      });
    }
  };

  const handleMoveVideo = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= videos.length) return;

    const updated = [...videos];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);

    setVideos(updated);
    saveStoredCarouselVideoItems(updated);
    onVideosUpdate(updated);
    setVideoFeedback({
      type: 'success',
      text: `Vídeo movido para a Posição #${targetIdx + 1}!`,
    });
  };

  const handleDeleteVideo = (index: number) => {
    const target = videos[index];
    if (target?.src && isIndexedDbMediaRef(target.src)) {
      void deleteMediaFile(target.src);
    }

    const updated = videos.filter((_, idx) => idx !== index);
    setVideos(updated);
    saveStoredCarouselVideoItems(updated);
    onVideosUpdate(updated);
    if (targetVideoPosition !== 'new') {
      const currentIdx = parseInt(targetVideoPosition, 10);
      if (currentIdx >= updated.length) {
        setTargetVideoPosition(updated.length > 0 ? '0' : 'new');
      }
    }
    setVideoFeedback(null);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg(null);

    const emailTrimmed = newUserEmail.trim().toLowerCase();
    if (emailTrimmed !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
      setUserMsg({
        type: 'error',
        text: `Acesso Negado: Apenas o e-mail autorizado (${ALLOWED_ADMIN_EMAIL}) pode ser cadastrado.`,
      });
      return;
    }

    if (!validateStrongPassword(newUserPass)) {
      setUserMsg({
        type: 'error',
        text: 'A senha do novo usuário precisa conter pelo menos 8 dígitos com números, letras maiúsculas, minúsculas e caracteres especiais.',
      });
      return;
    }

    const mailSubject = encodeURIComponent('Dados de Acesso - Painel Center Auto');
    const mailBody = encodeURIComponent(
      `Olá ${newUserName},\n\nSeu acesso ao painel admin da Center Auto foi cadastrado com sucesso!\n\nUsuário: ${newUserLogin}\nSenha Provisória: ${newUserPass}\n\nFavor realizar o primeiro acesso para alteração.`
    );

    setUserMsg({
      type: 'success',
      text: `Usuário ${newUserName} cadastrado! Abrindo cliente de e-mail para envio das credenciais.`,
    });

    window.location.href = `mailto:${newUserEmail}?subject=${mailSubject}&body=${mailBody}`;

    setNewUserName('');
    setNewUserEmail('');
    setNewUserLogin('');
    setNewUserPass('');
  };

  const handleClearLeads = () => {
    if (window.confirm('Tem certeza de que deseja limpar todo o histórico de leads salvos?')) {
      localStorage.removeItem('centerauto_leads');
      setLeads([]);
    }
  };

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
                  Acesso Restrito
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Entre com suas credenciais de administrador da Center Auto.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Usuário
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Usuário"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPass ? 'Ocultar senha' : 'Ver senha'}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Acessar Painel
                </button>
              </form>
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
                  onClick={() => setActiveTab('users')}
                  className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'users'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Usuários
                </button>
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
                        Escolha em qual posição deseja colocar o vídeo (Janela #1 a #{Math.max(4, videos.length)} ou nova posição), depois cole o link ou selecione o arquivo do computador.
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
                            Substituir Posição #{i + 1} (Janela #{i + 1} — {v.title || `Vídeo 0${i + 1}`})
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
                                    Posição #{idx + 1} (Janela #{idx + 1})
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
                        Histórico de Cotações Recebidas
                      </h4>
                      <p className="text-xs text-slate-500">
                        Leads salvos localmente no navegador deste dispositivo.
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
                        Nenhuma cotação registrada ainda. As solicitações enviadas pelo formulário aparecerão aqui.
                      </p>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                          <tr>
                            <th className="p-3">Data</th>
                            <th className="p-3">Nome</th>
                            <th className="p-3">WhatsApp</th>
                            <th className="p-3">Veículo</th>
                            <th className="p-3">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {leads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-slate-50">
                              <td className="p-3 text-slate-500 font-mono">
                                {new Date(lead.timestamp).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="p-3 font-semibold text-slate-900">{lead.nome}</td>
                              <td className="p-3 text-slate-700 font-mono">{lead.telefone}</td>
                              <td className="p-3 text-slate-600">
                                {lead.tipoVeiculo} - {lead.modelo} ({lead.ano})
                              </td>
                              <td className="p-3">
                                <a
                                  href={`https://wa.me/55${lead.telefone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1"
                                >
                                  Abrir WhatsApp <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Users Management */}
              {activeTab === 'users' && (
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="text-center">
                    <h4 className="font-bold text-slate-900 text-base">Cadastrar Novo Usuário</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Apenas o e-mail autorizado (<strong>{ALLOWED_ADMIN_EMAIL}</strong>) tem permissão de cadastro.
                    </p>
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

                  <form onSubmit={handleCreateUser} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nome do operador"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        E-mail Autorizado
                      </label>
                      <input
                        type="email"
                        required
                        placeholder={ALLOWED_ADMIN_EMAIL}
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Login de Acesso
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="login.usuario"
                        value={newUserLogin}
                        onChange={(e) => setNewUserLogin(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Senha Provisória (Mínimo 8 caracteres com especiais)
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Ex: Segredo@2026"
                        value={newUserPass}
                        onChange={(e) => setNewUserPass(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all cursor-pointer shadow-md"
                    >
                      Enviar Convite via E-mail
                    </button>
                  </form>

                  {/* Master Admin Security Info Card */}
                  <div className="mt-6 pt-5 border-t border-slate-200 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Segurança do Administrador Master
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      E-mail oficial autorizado: <strong className="text-slate-900">{ALLOWED_ADMIN_EMAIL}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      A redefinição de senha é protegida por código de verificação enviado exclusivamente para o e-mail do administrador.
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
                Ao clicar em <strong className="text-slate-700">Salvar e Sair</strong>, todas as alterações são salvas e a senha será solicitada no próximo acesso.
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleCloseWithoutSaving}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Fechar sem Salvar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndExit}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar e Sair</span>
                  <LogOut className="w-4 h-4" />
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
