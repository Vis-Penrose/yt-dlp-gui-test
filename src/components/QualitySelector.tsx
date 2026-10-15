import React from 'react';
import { VideoQuality } from '../types/ytdlp';
import { Check, Sparkles, Music } from 'lucide-react';

interface QualitySelectorProps {
  selectedQuality: VideoQuality;
  onSelectQuality: (quality: VideoQuality) => void;
  availableHeights?: number[];
}

interface QualityOption {
  value: VideoQuality;
  label: string;
  sublabel: string;
  badge?: string;
  minHeight?: number;
}

const QUALITY_OPTIONS: QualityOption[] = [
  {
    value: 'best',
    label: 'Best Available',
    sublabel: 'Highest resolution & audio stream',
    badge: 'Auto',
  },
  {
    value: '2160',
    label: '4K Ultra HD',
    sublabel: '3840×2160 · 2160p',
    badge: '4K',
    minHeight: 2160,
  },
  {
    value: '1440',
    label: '1440p Quad HD',
    sublabel: '2560×1440 · 2K',
    badge: '2K',
    minHeight: 1440,
  },
  {
    value: '1080',
    label: '1080p Full HD',
    sublabel: '1920×1080 · Standard HD',
    badge: 'FHD',
    minHeight: 1080,
  },
  {
    value: '720',
    label: '720p HD',
    sublabel: '1280×720 · Fast download',
    badge: 'HD',
    minHeight: 720,
  },
  {
    value: '480',
    label: '480p SD',
    sublabel: '854×480 · Compact file',
    badge: 'SD',
    minHeight: 480,
  },
  {
    value: '360',
    label: '360p Mobile',
    sublabel: '640×360 · Data saver',
    badge: 'Low',
    minHeight: 360,
  },
  {
    value: 'audio-only',
    label: 'Audio Only',
    sublabel: 'Extract MP3 / M4A / FLAC',
    badge: 'Audio',
  },
];

export const QualitySelector: React.FC<QualitySelectorProps> = ({
  selectedQuality,
  onSelectQuality,
  availableHeights = [],
}) => {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <span>Video Quality</span>
            {availableHeights.length > 0 && (
              <span className="text-xs text-emerald-400 font-mono font-normal">
                (Max stream: {availableHeights[0]}p detected)
              </span>
            )}
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Single-click quality profile. Higher resolutions use more disk space and time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {QUALITY_OPTIONS.map((opt) => {
          const isSelected = selectedQuality === opt.value;
          const isDetected = opt.minHeight ? availableHeights.includes(opt.minHeight) : true;
          const isHigherThanMax = opt.minHeight && availableHeights.length > 0
            ? opt.minHeight > availableHeights[0]
            : false;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectQuality(opt.value)}
              className={`relative text-left p-3 rounded-lg border transition-all flex flex-col justify-between min-h-[76px] ${
                isSelected
                  ? 'bg-neutral-800 border-red-500 shadow-sm ring-1 ring-red-500/30'
                  : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
              } ${isHigherThanMax ? 'opacity-60' : 'opacity-100'}`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-red-500 text-white'
                      : opt.value === 'audio-only'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {opt.badge}
                </span>

                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-red-400" />
                ) : opt.value === 'audio-only' ? (
                  <Music className="w-3.5 h-3.5 text-neutral-500" />
                ) : opt.value === 'best' ? (
                  <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                ) : null}
              </div>

              <div>
                <div className="text-xs font-semibold text-neutral-100 flex items-center gap-1.5">
                  <span>{opt.label}</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5 leading-tight font-mono">
                  {opt.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
