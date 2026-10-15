import React from 'react';
import { DownloadedFile } from '../types/ytdlp';
import { formatBytes } from '../utils/commandBuilder';
import {
  HardDrive,
  Download,
  Play,
  Trash2,
  Film,
  Music,
  FileText,
  RefreshCw,
  Folder,
} from 'lucide-react';

interface DownloadsLibraryProps {
  files: DownloadedFile[];
  isLoading: boolean;
  onRefresh: () => void;
  onPlay: (filename: string) => void;
  onDelete: (filename: string) => void;
  onGoToDownloader: () => void;
}

export const DownloadsLibrary: React.FC<DownloadsLibraryProps> = ({
  files,
  isLoading,
  onRefresh,
  onPlay,
  onDelete,
  onGoToDownloader,
}) => {
  const getFileIcon = (ext: string) => {
    if (['mp4', 'mkv', 'webm', 'mov'].includes(ext)) {
      return <Film className="w-4 h-4 text-red-400" />;
    }
    if (['mp3', 'm4a', 'flac', 'wav', 'opus'].includes(ext)) {
      return <Music className="w-4 h-4 text-amber-400" />;
    }
    return <FileText className="w-4 h-4 text-neutral-400" />;
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-red-500" />
            <span>Downloaded Media Library</span>
            <span className="text-xs font-mono font-normal text-neutral-400">
              ({files.length} {files.length === 1 ? 'file' : 'files'})
            </span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Files stored on server storage. Stream directly in your browser or save to your local machine.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-lg bg-neutral-950/40 border border-dashed border-neutral-800">
          <Folder className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-neutral-200">No media downloaded yet</h4>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1 mb-4">
            Completed downloads from yt-dlp will appear here with instant browser playback and one-click PC download.
          </p>
          <button
            type="button"
            onClick={onGoToDownloader}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5"
          >
            Start First Download
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[11px]">
                <th className="pb-3 font-semibold pl-2">File Name</th>
                <th className="pb-3 font-semibold">Folder</th>
                <th className="pb-3 font-semibold text-right">Size</th>
                <th className="pb-3 font-semibold text-right">Date</th>
                <th className="pb-3 font-semibold text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono tabular-nums">
              {files.map((file) => (
                <tr key={file.relativePath} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3 pl-2 pr-4 font-sans font-medium text-neutral-200 max-w-xs truncate">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-neutral-800 shrink-0">
                        {getFileIcon(file.ext)}
                      </div>
                      <span className="truncate">{file.filename}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-neutral-400 text-xs">
                    {file.folder}
                  </td>
                  <td className="py-3 pr-4 text-right text-neutral-300">
                    {formatBytes(file.size)}
                  </td>
                  <td className="py-3 pr-4 text-right text-neutral-400 text-[11px]">
                    {new Date(file.created).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPlay(file.relativePath)}
                        className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded transition-colors"
                        title="Stream / Play preview"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <a
                        href={`/api/files/${encodeURIComponent(file.relativePath)}?download=1`}
                        download
                        className="p-1.5 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded transition-colors"
                        title="Save to local computer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => onDelete(file.relativePath)}
                        className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 rounded transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
