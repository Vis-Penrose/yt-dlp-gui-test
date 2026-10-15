import React from 'react';
import { Terminal, HardDrive, Film, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { SystemStatus } from '../types/ytdlp';

interface HeaderProps {
  activeTab: 'downloader' | 'library' | 'generator' | 'presets';
  setActiveTab: (tab: 'downloader' | 'library' | 'generator' | 'presets') => void;
  systemStatus: SystemStatus | null;
  activeDownloadsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  activeDownloadsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-900 border-b border-neutral-800 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm font-bold text-sm tracking-tighter">
            ▶
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              yt-dlp GUI
            </span>
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
              v{systemStatus?.ytDlpVersion ? systemStatus.ytDlpVersion.replace(' (latest)', '') : '2026.08'}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('downloader')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'downloader'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Downloader</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>1-Click Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'generator'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>CLI Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Library</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary status / action */}
        <div className="flex items-center gap-3 shrink-0">
          {activeDownloadsCount > 0 ? (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md text-xs font-mono tabular-nums">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>{activeDownloadsCount} downloading</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Core Ready</span>
              <span className="text-neutral-600">·</span>
              <span>FFmpeg 4.4</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
