import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Subtitles, Image, Tag, ShieldCheck, Gauge, Sliders } from 'lucide-react';

interface AdvancedOptionsProps {
  embedSubtitles: boolean;
  onToggleEmbedSubtitles: (val: boolean) => void;
  subtitlesLang: string;
  onChangeSubtitlesLang: (lang: string) => void;
  embedThumbnail: boolean;
  onToggleEmbedThumbnail: (val: boolean) => void;
  addMetadata: boolean;
  onToggleAddMetadata: (val: boolean) => void;
  sponsorblock: boolean;
  onToggleSponsorblock: (val: boolean) => void;
  rateLimit: string;
  onChangeRateLimit: (limit: string) => void;
  availableSubtitles?: string[];
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  embedSubtitles,
  onToggleEmbedSubtitles,
  subtitlesLang,
  onChangeSubtitlesLang,
  embedThumbnail,
  onToggleEmbedThumbnail,
  addMetadata,
  onToggleAddMetadata,
  sponsorblock,
  onToggleSponsorblock,
  rateLimit,
  onChangeRateLimit,
  availableSubtitles = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left hover:bg-neutral-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Sliders className="w-4 h-4 text-neutral-400" />
          <span className="text-xs sm:text-sm font-semibold text-neutral-200">
            Advanced Download Options & Metadata
          </span>
          <span className="text-xs text-neutral-400">
            (Subtitles, Chapter tags, Artwork, SponsorBlock)
          </span>
        </div>
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="text-xs font-mono">{isOpen ? 'Hide' : 'Configure'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 pt-2 border-t border-neutral-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Embed Thumbnail */}
            <label className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80 hover:border-neutral-700 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={embedThumbnail}
                onChange={(e) => onToggleEmbedThumbnail(e.target.checked)}
                className="mt-0.5 rounded border-neutral-700 text-red-600 focus:ring-red-500 w-4 h-4"
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-200">
                  <Image className="w-3.5 h-3.5 text-amber-400" />
                  <span>Embed Thumbnail</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Embeds cover art inside MP4/MKV/MP3
                </div>
              </div>
            </label>

            {/* Add Metadata */}
            <label className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80 hover:border-neutral-700 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={addMetadata}
                onChange={(e) => onToggleAddMetadata(e.target.checked)}
                className="mt-0.5 rounded border-neutral-700 text-red-600 focus:ring-red-500 w-4 h-4"
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-200">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  <span>Add Metadata & Tags</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Writes artist, year, title & chapters
                </div>
              </div>
            </label>

            {/* SponsorBlock */}
            <label className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80 hover:border-neutral-700 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={sponsorblock}
                onChange={(e) => onToggleSponsorblock(e.target.checked)}
                className="mt-0.5 rounded border-neutral-700 text-red-600 focus:ring-red-500 w-4 h-4"
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Skip Sponsors</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Auto-cuts sponsor segments via SponsorBlock
                </div>
              </div>
            </label>

            {/* Embed Subtitles */}
            <label className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80 hover:border-neutral-700 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={embedSubtitles}
                onChange={(e) => onToggleEmbedSubtitles(e.target.checked)}
                className="mt-0.5 rounded border-neutral-700 text-red-600 focus:ring-red-500 w-4 h-4"
              />
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-200">
                  <Subtitles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Embed Subtitles</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Downloads soft subtitles into container
                </div>
              </div>
            </label>
          </div>

          {/* Subtitles Language & Speed Limit Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {embedSubtitles && (
              <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-lg flex items-center justify-between">
                <span className="text-xs text-neutral-300 font-medium">Subtitle Language:</span>
                <select
                  value={subtitlesLang}
                  onChange={(e) => onChangeSubtitlesLang(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 rounded text-xs text-neutral-200 px-2 py-1 focus:outline-none focus:border-red-500"
                >
                  <option value="en">English (en)</option>
                  <option value="es">Spanish (es)</option>
                  <option value="fr">French (fr)</option>
                  <option value="de">German (de)</option>
                  <option value="ja">Japanese (ja)</option>
                  <option value="zh">Chinese (zh)</option>
                  <option value="all">All Available Tracks</option>
                </select>
              </div>
            )}

            <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-xs text-neutral-300 font-medium">Download Rate Limit:</span>
              </div>
              <div className="flex items-center gap-1">
                {(['unlimited', '2M', '5M', '10M'] as const).map((limit) => (
                  <button
                    key={limit}
                    type="button"
                    onClick={() => onChangeRateLimit(limit)}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                      rateLimit === limit
                        ? 'bg-neutral-800 text-white font-semibold border border-neutral-600'
                        : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {limit === 'unlimited' ? 'Max' : limit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
