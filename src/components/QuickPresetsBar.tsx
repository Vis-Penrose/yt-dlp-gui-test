import React from 'react';
import { Sparkles, Film, Music, Headphones, Zap, Monitor } from 'lucide-react';
import { VideoQuality, MediaFormat, QuickPreset } from '../types/ytdlp';

interface QuickPresetsBarProps {
  onApplyPreset: (preset: QuickPreset) => void;
  activeQuality: VideoQuality;
  activeFormat: MediaFormat;
  activeFolder: string;
}

export const PRESETS: QuickPreset[] = [
  {
    id: 'standard-hd',
    label: 'Best 1080p MP4',
    tagline: 'Standard Full HD · Universal playback',
    quality: '1080',
    format: 'mp4',
    destination: 'videos',
    embedThumbnail: true,
    addMetadata: true,
  },
  {
    id: 'master-4k',
    label: '4K Ultra MKV',
    tagline: 'Highest bitrate · Multi-track audio',
    quality: '2160',
    format: 'mkv',
    destination: 'videos',
    embedThumbnail: true,
    addMetadata: true,
  },
  {
    id: 'audio-mp3',
    label: 'Music 320k MP3',
    tagline: 'Audio extract · Embedded album art',
    quality: 'audio-only',
    format: 'mp3',
    audioBitrate: '320',
    destination: 'music',
    embedThumbnail: true,
    addMetadata: true,
  },
  {
    id: 'podcast-m4a',
    label: 'Podcast / Speech M4A',
    tagline: 'Clean AAC audio · Chapter markers',
    quality: 'audio-only',
    format: 'm4a',
    audioBitrate: '192',
    destination: 'podcasts',
    embedThumbnail: true,
    addMetadata: true,
  },
  {
    id: 'quick-720',
    label: 'Fast 720p HD',
    tagline: 'Lightweight · Fast mobile & share',
    quality: '720',
    format: 'mp4',
    destination: 'downloads',
    embedThumbnail: true,
    addMetadata: true,
  },
];

export const QuickPresetsBar: React.FC<QuickPresetsBarProps> = ({
  onApplyPreset,
  activeQuality,
  activeFormat,
  activeFolder,
}) => {
  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 sm:p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
            One-Click Instant Presets
          </h2>
        </div>
        <span className="text-xs text-neutral-400">Applies quality, format & destination together</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {PRESETS.map((preset) => {
          const isSelected =
            activeQuality === preset.quality &&
            activeFormat === preset.format &&
            activeFolder === preset.destination;

          const getIcon = () => {
            switch (preset.id) {
              case 'master-4k':
                return <Monitor className="w-4 h-4" />;
              case 'audio-mp3':
                return <Music className="w-4 h-4" />;
              case 'podcast-m4a':
                return <Headphones className="w-4 h-4" />;
              case 'quick-720':
                return <Zap className="w-4 h-4" />;
              default:
                return <Film className="w-4 h-4" />;
            }
          };

          return (
            <button
              key={preset.id}
              onClick={() => onApplyPreset(preset)}
              className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-neutral-800 border-red-500/80 ring-1 ring-red-500/40 text-white'
                  : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/60 text-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className={`p-1.5 rounded-md ${isSelected ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800 text-neutral-400'}`}>
                  {getIcon()}
                </div>
                {isSelected && (
                  <span className="text-[10px] uppercase font-mono font-bold text-red-400">
                    Active
                  </span>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight leading-snug">
                  {preset.label}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                  {preset.tagline}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
