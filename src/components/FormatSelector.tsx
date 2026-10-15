import React from 'react';
import { MediaFormat, VideoQuality } from '../types/ytdlp';
import { Film, Music, Check } from 'lucide-react';

interface FormatSelectorProps {
  selectedFormat: MediaFormat;
  onSelectFormat: (format: MediaFormat) => void;
  selectedQuality: VideoQuality;
  audioBitrate: string;
  onSelectAudioBitrate: (bitrate: string) => void;
}

interface FormatItem {
  id: MediaFormat;
  label: string;
  desc: string;
  isAudio: boolean;
  recommendedFor?: string;
}

const VIDEO_FORMATS: FormatItem[] = [
  { id: 'mp4', label: 'MP4', desc: 'Universal video container (H.264 / AAC). Compatible with all phones, TVs & editors.', isAudio: false, recommendedFor: 'Universal' },
  { id: 'mkv', label: 'MKV', desc: 'Matroska container. Supports multi-track audio, soft subtitles & AV1/VP9 video.', isAudio: false, recommendedFor: 'Best Quality' },
  { id: 'webm', label: 'WebM', desc: 'Open web video container (VP9 / Opus). Optimized for browser streaming.', isAudio: false },
];

const AUDIO_FORMATS: FormatItem[] = [
  { id: 'mp3', label: 'MP3', desc: 'Universal audio. Plays on every car, speaker, phone & music software.', isAudio: true, recommendedFor: 'Music' },
  { id: 'm4a', label: 'M4A (AAC)', desc: 'Apple standard audio. Higher fidelity than MP3 at similar bitrate.', isAudio: true, recommendedFor: 'Podcasts' },
  { id: 'flac', label: 'FLAC', desc: 'Lossless audio compression. Studio-grade archival sound without data loss.', isAudio: true, recommendedFor: 'Archival' },
  { id: 'opus', label: 'OPUS', desc: 'Modern high-efficiency speech and music codec with low latency.', isAudio: true },
  { id: 'wav', label: 'WAV', desc: 'Uncompressed raw audio PCM. Heavy file size, zero compression.', isAudio: true },
];

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onSelectFormat,
  selectedQuality,
  audioBitrate,
  onSelectAudioBitrate,
}) => {
  const isAudioMode = selectedQuality === 'audio-only' || AUDIO_FORMATS.some(f => f.id === selectedFormat);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <span>Container & Codec Format</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            1-click container packaging. yt-dlp automatically remuxes via FFmpeg.
          </p>
        </div>
      </div>

      {/* Video Formats */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Film className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-xs font-medium text-neutral-300">Video Containers</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {VIDEO_FORMATS.map((f) => {
            const isSelected = selectedFormat === f.id && selectedQuality !== 'audio-only';
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelectFormat(f.id)}
                className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-800 border-red-500 shadow-sm ring-1 ring-red-500/30'
                    : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-100 uppercase font-mono">
                      {f.label}
                    </span>
                    {f.recommendedFor && (
                      <span className="text-[10px] text-neutral-400 font-normal">
                        · {f.recommendedFor}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-red-400" />}
                </div>
                <div className="text-[11px] text-neutral-400 leading-tight">
                  {f.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audio Formats */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Music className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs font-medium text-neutral-300">Audio Formats</span>
          </div>
          {isAudioMode && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-neutral-400 mr-1">Bitrate:</span>
              {(['320', '256', '192', '128'] as const).map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => onSelectAudioBitrate(rate)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                    audioBitrate === rate
                      ? 'bg-red-500/20 text-red-400 font-semibold border border-red-500/40'
                      : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {rate}k
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {AUDIO_FORMATS.map((f) => {
            const isSelected = selectedFormat === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelectFormat(f.id)}
                className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-800 border-red-500 shadow-sm ring-1 ring-red-500/30'
                    : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-neutral-100 uppercase font-mono">
                    {f.label}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-red-400" />}
                </div>
                <div className="text-[10px] text-neutral-400 leading-tight line-clamp-2">
                  {f.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
