import React, { useState } from 'react';
import { VideoMetadata } from '../types/ytdlp';
import { formatDuration } from '../utils/commandBuilder';
import { Play, User, Clock, Eye, Film, CheckCircle2 } from 'lucide-react';

interface VideoPreviewCardProps {
  metadata: VideoMetadata;
  onClear: () => void;
}

export const VideoPreviewCard: React.FC<VideoPreviewCardProps> = ({ metadata, onClear }) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 mb-6">
      <div className="flex flex-col md:flex-row gap-4 sm:gap-5 items-start">
        {/* Thumbnail container */}
        <div className="relative w-full md:w-64 aspect-video rounded-lg overflow-hidden bg-neutral-950 shrink-0 border border-neutral-800">
          {metadata.thumbnail && !imageFailed ? (
            <img
              src={metadata.thumbnail}
              alt={metadata.title}
              referrerPolicy="no-referrer"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-2">
              <Film className="w-8 h-8" />
              <span className="text-xs font-mono">Preview Ready</span>
            </div>
          )}

          {metadata.duration && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/85 text-white font-mono text-[11px] rounded tabular-nums">
              {formatDuration(metadata.duration)}
            </div>
          )}
        </div>

        {/* Info details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Streams Inspected</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-neutral-100 tracking-tight leading-snug line-clamp-2">
            {metadata.title}
          </h3>

          {/* Zero-Pill metadata with subtle typographic separators */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-400 mt-2 font-mono tabular-nums">
            <div className="flex items-center gap-1 text-neutral-300">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <span>{metadata.uploader}</span>
            </div>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            {metadata.duration && (
              <>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{formatDuration(metadata.duration)}</span>
                </div>
                <span aria-hidden="true" className="text-neutral-600">·</span>
              </>
            )}
            {metadata.viewCount && (
              <>
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{metadata.viewCount.toLocaleString()} views</span>
                </div>
                <span aria-hidden="true" className="text-neutral-600">·</span>
              </>
            )}
            <span>ID: {metadata.id}</span>
          </div>

          {/* Detected streams */}
          {metadata.availableHeights.length > 0 && (
            <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center flex-wrap gap-2 text-xs text-neutral-400">
              <span className="text-neutral-300 font-medium">Available streams:</span>
              <span className="font-mono text-neutral-300">
                {metadata.availableHeights.map((h) => `${h}p`).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
