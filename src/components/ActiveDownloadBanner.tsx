import React, { useState, useEffect, useRef } from 'react';
import { DownloadJobState } from '../types/ytdlp';
import {
  Download,
  Square,
  Play,
  Terminal,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  HardDrive,
  ExternalLink,
} from 'lucide-react';

interface ActiveDownloadBannerProps {
  job: DownloadJobState;
  onAbort: (jobId: string) => void;
  onPlayFile?: (filename: string) => void;
  onDismiss: () => void;
}

export const ActiveDownloadBanner: React.FC<ActiveDownloadBannerProps> = ({
  job,
  onAbort,
  onPlayFile,
  onDismiss,
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showLogs && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [job.logs, showLogs]);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(job.logs.join('\n'));
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  const isCompleted = job.status === 'completed';
  const isError = job.status === 'error';
  const isAborted = job.status === 'aborted';
  const isRunning = job.status === 'downloading' || job.status === 'processing' || job.status === 'pending';

  return (
    <div
      className={`border rounded-xl p-4 sm:p-5 mb-6 transition-all ${
        isCompleted
          ? 'bg-neutral-900 border-emerald-500/50 shadow-sm'
          : isError || isAborted
          ? 'bg-neutral-900 border-red-500/50'
          : 'bg-neutral-900 border-neutral-700 shadow-sm'
      }`}
    >
      {/* Top row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {isRunning ? (
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 animate-bounce" />
            </div>
          ) : isCompleted ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-neutral-400">
                {job.status === 'downloading'
                  ? 'Downloading Stream'
                  : job.status === 'processing'
                  ? 'FFmpeg Merging / Post-processing'
                  : job.status === 'completed'
                  ? 'Download Completed'
                  : job.status === 'aborted'
                  ? 'Cancelled by User'
                  : 'Task Failed'}
              </span>
              <span className="text-neutral-600">·</span>
              <span className="text-xs font-mono text-neutral-400">{job.format.toUpperCase()}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-xs font-mono text-neutral-400">{job.destinationFolder}</span>
            </div>
            <h4 className="text-sm sm:text-base font-semibold text-neutral-100 truncate mt-0.5">
              {job.title}
            </h4>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {isRunning && (
            <button
              type="button"
              onClick={() => onAbort(job.id)}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-red-950 text-neutral-300 hover:text-red-300 border border-neutral-700 hover:border-red-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Cancel</span>
            </button>
          )}

          {isCompleted && job.filename && (
            <>
              {onPlayFile && (
                <button
                  type="button"
                  onClick={() => onPlayFile(job.filename!)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </button>
              )}
              <a
                href={`/api/files/${encodeURIComponent(job.filename)}?download=1`}
                download
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to PC</span>
              </a>
            </>
          )}

          <button
            type="button"
            onClick={onDismiss}
            className="px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-3">
        <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-neutral-800">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              isCompleted
                ? 'bg-emerald-500'
                : isError || isAborted
                ? 'bg-red-500'
                : 'bg-red-600'
            }`}
            style={{ width: `${Math.max(job.percent, 3)}%` }}
          />
        </div>

        {/* Tabular telemetry figures */}
        <div className="flex items-center justify-between text-xs font-mono tabular-nums text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-neutral-200">{job.percent.toFixed(1)}%</span>
            <span>Speed: {job.speed || '--'}</span>
            <span>ETA: {job.eta || '--'}</span>
          </div>
          <div>
            <span>Size: {job.totalBytes || (job.fileSize ? `${(job.fileSize / 1048576).toFixed(1)} MiB` : '--')}</span>
          </div>
        </div>
      </div>

      {/* File destination confirmation when completed */}
      {isCompleted && job.filename && (
        <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg flex items-center justify-between text-xs font-mono mb-2">
          <div className="flex items-center gap-2 text-neutral-300 truncate">
            <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Saved in destination: {job.filename}</span>
          </div>
          <span className="text-neutral-500 text-[11px] shrink-0 ml-2">
            Folder: {job.destinationFolder}
          </span>
        </div>
      )}

      {/* Terminal log toggle */}
      <div className="border-t border-neutral-800/80 pt-2 mt-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 font-mono transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal Output ({job.logs.length} lines)</span>
            {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showLogs && (
            <button
              type="button"
              onClick={handleCopyLogs}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {copiedLog ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLog ? 'Copied' : 'Copy log'}</span>
            </button>
          )}
        </div>

        {showLogs && (
          <div
            ref={logContainerRef}
            className="mt-2.5 bg-neutral-950 border border-neutral-800 rounded-lg p-3 max-h-48 overflow-y-auto font-mono text-[11px] text-neutral-300 space-y-1 select-text"
          >
            {job.logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed break-all">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
