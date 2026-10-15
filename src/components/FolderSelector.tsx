import React, { useState } from 'react';
import { Folder, HardDrive, Check, Edit3, ArrowDownToLine, Film, Music, Headphones, Archive } from 'lucide-react';
import { FolderPreset } from '../types/ytdlp';

interface FolderSelectorProps {
  selectedFolder: string;
  onSelectFolder: (folderId: string) => void;
  customPath: string;
  onChangeCustomPath: (path: string) => void;
  autoBrowserDownload: boolean;
  onToggleAutoBrowserDownload: (val: boolean) => void;
}

const FOLDER_PRESETS: FolderPreset[] = [
  {
    id: 'downloads',
    name: 'Downloads',
    path: '~/Downloads',
    description: 'Default user downloads folder',
    iconType: 'download',
  },
  {
    id: 'videos',
    name: 'Videos',
    path: '~/Videos',
    description: 'Dedicated movies & clips folder',
    iconType: 'video',
  },
  {
    id: 'music',
    name: 'Music',
    path: '~/Music',
    description: 'Audio & soundtrack library',
    iconType: 'music',
  },
  {
    id: 'podcasts',
    name: 'Podcasts',
    path: '~/Podcasts',
    description: 'Episodes & spoken talk audio',
    iconType: 'podcast',
  },
  {
    id: 'archive',
    name: 'Archive',
    path: '~/Archive',
    description: 'Long-term offline backup',
    iconType: 'archive',
  },
  {
    id: 'custom',
    name: 'Custom Path...',
    path: 'Specific target directory',
    description: 'Define your own path on disk',
    iconType: 'custom',
  },
];

export const FolderSelector: React.FC<FolderSelectorProps> = ({
  selectedFolder,
  onSelectFolder,
  customPath,
  onChangeCustomPath,
  autoBrowserDownload,
  onToggleAutoBrowserDownload,
}) => {
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  const getFolderIcon = (type: FolderPreset['iconType']) => {
    switch (type) {
      case 'video':
        return <Film className="w-4 h-4" />;
      case 'music':
        return <Music className="w-4 h-4" />;
      case 'podcast':
        return <Headphones className="w-4 h-4" />;
      case 'archive':
        return <Archive className="w-4 h-4" />;
      case 'custom':
        return <Edit3 className="w-4 h-4" />;
      default:
        return <Folder className="w-4 h-4" />;
    }
  };

  const quickCustomTokens = [
    '~/Desktop',
    '~/Movies',
    '/media/external-drive',
    '~/Documents/yt-dlp',
  ];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <span>Download Destination Folder</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Single-click directory routing. Files are stored systematically and indexed.
          </p>
        </div>

        {/* 1-click Browser Auto Download switch */}
        <label className="flex items-center gap-2 cursor-pointer bg-neutral-800/80 hover:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-700/60 transition-colors">
          <input
            type="checkbox"
            checked={autoBrowserDownload}
            onChange={(e) => onToggleAutoBrowserDownload(e.target.checked)}
            className="rounded border-neutral-700 text-red-600 focus:ring-red-500 w-3.5 h-3.5"
          />
          <ArrowDownToLine className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs font-medium text-neutral-200 whitespace-nowrap">
            Auto-save to Browser Downloads
          </span>
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {FOLDER_PRESETS.map((folder) => {
          const isSelected = selectedFolder === folder.id;

          return (
            <button
              key={folder.id}
              type="button"
              onClick={() => {
                onSelectFolder(folder.id);
                if (folder.id === 'custom') {
                  setIsEditingCustom(true);
                }
              }}
              className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between min-h-[78px] ${
                isSelected
                  ? 'bg-neutral-800 border-red-500 shadow-sm ring-1 ring-red-500/30'
                  : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div
                  className={`p-1.5 rounded-md ${
                    isSelected ? 'bg-red-500/20 text-red-400' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {getFolderIcon(folder.iconType)}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-red-400" />}
              </div>

              <div>
                <div className="text-xs font-semibold text-neutral-100 tracking-tight">
                  {folder.name}
                </div>
                <div className="text-[11px] text-neutral-400 font-mono mt-0.5 truncate">
                  {folder.id === 'custom' && customPath ? customPath : folder.path}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Path Input Drawer */}
      {selectedFolder === 'custom' && (
        <div className="mt-3.5 pt-3.5 border-t border-neutral-800">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={customPath}
                onChange={(e) => onChangeCustomPath(e.target.value)}
                placeholder="/path/to/custom/destination"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-500 mr-1">Quick paths:</span>
              {quickCustomTokens.map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => onChangeCustomPath(token)}
                  className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] font-mono transition-colors"
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
