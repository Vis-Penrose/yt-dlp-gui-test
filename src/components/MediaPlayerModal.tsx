import React from 'react';
import { X, Download, Film, Music } from 'lucide-react';

interface MediaPlayerModalProps {
  filePath: string;
  onClose: () => void;
}

export const MediaPlayerModal: React.FC<MediaPlayerModalProps> = ({ filePath, onClose }) => {
  const filename = filePath.split('/').pop() || filePath;
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const isAudio = ['mp3', 'm4a', 'flac', 'wav', 'opus'].includes(ext);
  const mediaSrc = `/api/files/${encodeURIComponent(filePath)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-4 py-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate pr-4">
            {isAudio ? <Music className="w-4 h-4 text-amber-400 shrink-0" /> : <Film className="w-4 h-4 text-red-400 shrink-0" />}
            <span className="text-sm font-semibold text-neutral-200 truncate">{filename}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`${mediaSrc}?download=1`}
              download
              className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs flex items-center gap-1.5 transition-colors border border-neutral-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save to PC</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Content */}
        <div className="p-4 bg-black flex items-center justify-center min-h-[280px]">
          {isAudio ? (
            <div className="w-full max-w-md p-6 bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Music className="w-10 h-10" />
              </div>
              <p className="text-xs text-neutral-400 font-mono mb-4 text-center truncate max-w-xs">{filename}</p>
              <audio controls autoPlay src={mediaSrc} className="w-full">
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : (
            <video
              controls
              autoPlay
              src={mediaSrc}
              className="w-full max-h-[70vh] rounded-md shadow"
            >
              Your browser does not support video playback.
            </video>
          )}
        </div>
      </div>
    </div>
  );
};
