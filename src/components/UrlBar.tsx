import React, { useState } from 'react';
import { Link2, Search, Clipboard, X, Loader2, Sparkles } from 'lucide-react';

interface UrlBarProps {
  url: string;
  onChangeUrl: (url: string) => void;
  onInspect: (url: string) => void;
  isInspecting: boolean;
  onClear: () => void;
}

const SAMPLE_URLS = [
  {
    label: 'Big Buck Bunny (4K/60fps)',
    url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
  },
  {
    label: 'Costa Rica 4K Ultra HD',
    url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
  },
  {
    label: 'Open Source Audio / Music',
    url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
  },
];

export const UrlBar: React.FC<UrlBarProps> = ({
  url,
  onChangeUrl,
  onInspect,
  isInspecting,
  onClear,
}) => {
  const [pasteError, setPasteError] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChangeUrl(text.trim());
        setPasteError(null);
      }
    } catch {
      setPasteError('Clipboard access blocked. Please press Ctrl+V / Cmd+V');
      setTimeout(() => setPasteError(null), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && url.trim()) {
      onInspect(url.trim());
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="media-url" className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-red-500" />
          <span>Media URL</span>
        </label>
        <span className="text-xs text-neutral-400">
          Supports YouTube, Vimeo, Twitch, Twitter/X, SoundCloud & 1,000+ sites
        </span>
      </div>

      <div className="relative flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            id="media-url"
            type="text"
            value={url}
            onChange={(e) => onChangeUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste video or audio URL here (e.g. https://www.youtube.com/watch?v=...)"
            className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg pl-3 pr-20 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {url && (
              <button
                type="button"
                onClick={onClear}
                className="p-1 text-neutral-400 hover:text-neutral-200 rounded transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handlePaste}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs flex items-center gap-1 transition-colors"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paste</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onInspect(url.trim())}
          disabled={!url.trim() || isInspecting}
          className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap border border-neutral-700"
        >
          {isInspecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-red-400" />
              <span>Inspecting...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Inspect Video</span>
            </>
          )}
        </button>
      </div>

      {pasteError && (
        <div className="text-xs text-amber-400 mt-2 font-mono">{pasteError}</div>
      )}

      {/* Quick sample URLs */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <div className="flex items-center gap-1 text-[11px] text-neutral-400">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Quick Samples:</span>
        </div>
        {SAMPLE_URLS.map((sample) => (
          <button
            key={sample.label}
            type="button"
            onClick={() => {
              onChangeUrl(sample.url);
              onInspect(sample.url);
            }}
            className="text-[11px] text-neutral-400 hover:text-white bg-neutral-950/60 hover:bg-neutral-800 border border-neutral-800 px-2 py-0.5 rounded transition-colors"
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
};
