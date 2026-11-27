import React from 'react';
import { Youtube, ExternalLink, Play } from 'lucide-react';
import { CarouselVideo } from '../types';
import { parseVideoSource, DEFAULT_CAROUSEL_VIDEO_ITEMS } from '../utils/storage';
import { isIndexedDbMediaRef } from '../utils/mediaDb';
import { MediaVideoPlayer } from './MediaRenderer';

interface VideosSectionProps {
  videos: CarouselVideo[];
}

export const VideosSection: React.FC<VideosSectionProps> = ({ videos }) => {
  // Ensure we always have at least 4 video entries to display 4 side-by-side windows
  const displayVideos: CarouselVideo[] = [...videos];
  while (displayVideos.length < 4) {
    const fallback = DEFAULT_CAROUSEL_VIDEO_ITEMS[displayVideos.length % DEFAULT_CAROUSEL_VIDEO_ITEMS.length];
    displayVideos.push({
      ...fallback,
      id: `fallback_${displayVideos.length}_${fallback.id}`,
    });
  }

  return (
    <section id="videos" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Apresentações & Demonstrações
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0d1e38] mt-2 tracking-tight">
            Conheça a Center Auto em Vídeo
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Assista aos nossos vídeos explicativos e veja como funcionam as coberturas, o socorro emergencial 24h e as vantagens do nosso clube de benefícios.
          </p>
        </div>

        {/* Video Windows Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayVideos.map((videoItem, idx) => {
            const parsed = parseVideoSource(videoItem.src);
            const isUpload =
              isIndexedDbMediaRef(videoItem.src) || videoItem.src.startsWith('data:video');
            const title = videoItem.title?.trim() || `Vídeo 0${idx + 1}`;
            const desc =
              videoItem.description?.trim() ||
              'Conteúdo informativo Center Auto Proteção Veicular.';

            return (
              <div
                key={`${videoItem.id}_${idx}`}
                className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Small Video Window (Aspect 16:9) */}
                <div className="relative w-full aspect-video bg-black overflow-hidden border-b border-slate-200">
                  <MediaVideoPlayer
                    src={videoItem.src}
                    title={title}
                  />
                </div>

                {/* Video Info Label */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#0d1e38] group-hover:text-orange-600 transition-colors line-clamp-1">
                      {title}
                    </h4>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <Play className="w-3 h-3 fill-current" /> Reprodução Disponível
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">
                      {isUpload ? 'upload' : parsed.type}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom YouTube Channel Banner */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Acompanhe mais conteúdos em nosso canal oficial
              </h4>
              <p className="text-xs text-slate-500">
                Dicas de segurança, novidades da associação e depoimentos de associados.
              </p>
            </div>
          </div>

          <a
            href="https://www.youtube.com/@centerautoprotecaoveicular/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors whitespace-nowrap cursor-pointer shadow-sm"
          >
            <Youtube className="w-4 h-4" />
            <span>Canal no YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};
