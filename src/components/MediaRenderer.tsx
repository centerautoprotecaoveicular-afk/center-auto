import React from 'react';
import { useResolvedMediaUrl } from '../utils/mediaDb';
import { parseVideoSource } from '../utils/storage';

interface MediaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const MediaImage: React.FC<MediaImageProps> = ({ src, alt, ...rest }) => {
  const resolvedSrc = useResolvedMediaUrl(src);

  if (!resolvedSrc) {
    return <div className={rest.className || 'w-full h-full bg-slate-900'} />;
  }

  return <img src={resolvedSrc} alt={alt || ''} {...rest} />;
};

interface MediaVideoPlayerProps {
  src: string;
  title?: string;
  className?: string;
  controls?: boolean;
  previewOnly?: boolean;
}

export const MediaVideoPlayer: React.FC<MediaVideoPlayerProps> = ({
  src,
  title = 'Vídeo',
  className = '',
  controls = true,
  previewOnly = false,
}) => {
  const resolvedSrc = useResolvedMediaUrl(src);
  const parsed = parseVideoSource(resolvedSrc || src);

  if (parsed.type === 'youtube' || parsed.type === 'vimeo') {
    return (
      <iframe
        src={parsed.src}
        title={title}
        className={`absolute inset-0 w-full h-full max-w-full max-h-full border-0 ${
          previewOnly ? 'pointer-events-none opacity-85' : ''
        } ${className}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={!previewOnly}
      />
    );
  }

  if (!resolvedSrc) {
    return (
      <div className="absolute inset-0 w-full h-full bg-slate-900 flex items-center justify-center text-xs text-slate-400">
        Carregando vídeo...
      </div>
    );
  }

  return (
    <video
      src={resolvedSrc}
      controls={controls && !previewOnly}
      playsInline
      preload="metadata"
      muted={previewOnly}
      className={`absolute inset-0 w-full h-full max-w-full max-h-full object-contain bg-black ${
        previewOnly ? 'pointer-events-none opacity-85' : ''
      } ${className}`}
    />
  );
};
