import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { QuickPresetsBar, PRESETS } from './components/QuickPresetsBar';
import { UrlBar } from './components/UrlBar';
import { VideoPreviewCard } from './components/VideoPreviewCard';
import { QualitySelector } from './components/QualitySelector';
import { FormatSelector } from './components/FormatSelector';
import { FolderSelector } from './components/FolderSelector';
import { AdvancedOptions } from './components/AdvancedOptions';
import { ActiveDownloadBanner } from './components/ActiveDownloadBanner';
import { CliCommandView } from './components/CliCommandView';
import { DownloadsLibrary } from './components/DownloadsLibrary';
import { MediaPlayerModal } from './components/MediaPlayerModal';
import {
  VideoQuality,
  MediaFormat,
  QuickPreset,
  VideoMetadata,
  DownloadJobState,
  DownloadedFile,
  SystemStatus,
} from './types/ytdlp';
import { buildCommandString } from './utils/commandBuilder';
import { Download, Loader2, Sparkles, Terminal, HardDrive, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'downloader' | 'library' | 'generator' | 'presets'>('downloader');

  // Input & Inspection
  const [url, setUrl] = useState('');
  const [isInspecting, setIsInspecting] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [inspectError, setInspectError] = useState<string | null>(null);

  // 1-Click Options
  const [quality, setQuality] = useState<VideoQuality>('1080');
  const [format, setFormat] = useState<MediaFormat>('mp4');
  const [destinationFolder, setDestinationFolder] = useState<string>('downloads');
  const [customFolder, setCustomFolder] = useState<string>('~/Desktop');
  const [audioBitrate, setAudioBitrate] = useState<string>('320');
  const [autoBrowserDownload, setAutoBrowserDownload] = useState<boolean>(true);

  // Advanced Flags
  const [embedSubtitles, setEmbedSubtitles] = useState(false);
  const [subtitlesLang, setSubtitlesLang] = useState('en');
  const [embedThumbnail, setEmbedThumbnail] = useState(true);
  const [addMetadata, setAddMetadata] = useState(true);
  const [sponsorblock, setSponsorblock] = useState(false);
  const [rateLimit, setRateLimit] = useState('unlimited');

  // Active Download & Jobs
  const [activeJob, setActiveJob] = useState<DownloadJobState | null>(null);
  const [isStartingDownload, setIsStartingDownload] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // System & Library State
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [libraryFiles, setLibraryFiles] = useState<DownloadedFile[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Media Player Modal
  const [playingFilePath, setPlayingFilePath] = useState<string | null>(null);

  // Fetch system status on load
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => setSystemStatus(data))
      .catch((err) => console.error('Status check failed:', err));

    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const res = await fetch('/api/downloads');
      if (res.ok) {
        const data = await res.json();
        setLibraryFiles(data.files || []);
      }
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  // Inspect URL
  const handleInspect = async (targetUrl: string) => {
    if (!targetUrl) return;
    setIsInspecting(true);
    setInspectError(null);
    setGeneralError(null);

    try {
      const res = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to inspect link.');
      }

      setVideoMetadata(data);

      // Auto-adapt quality if requested quality exceeds available streams
      if (data.availableHeights && data.availableHeights.length > 0) {
        const maxHeight = data.availableHeights[0];
        if (quality !== 'audio-only' && quality !== 'best') {
          const qNum = parseInt(quality, 10);
          if (qNum > maxHeight) {
            setQuality(String(maxHeight) as VideoQuality);
          }
        }
      }
    } catch (err: any) {
      setInspectError(err.message || 'Inspection error.');
    } finally {
      setIsInspecting(false);
    }
  };

  // 1-Click apply preset
  const handleApplyPreset = (preset: QuickPreset) => {
    setQuality(preset.quality);
    setFormat(preset.format);
    setDestinationFolder(preset.destination);
    if (preset.audioBitrate) setAudioBitrate(preset.audioBitrate);
    if (preset.embedThumbnail !== undefined) setEmbedThumbnail(preset.embedThumbnail);
    if (preset.addMetadata !== undefined) setAddMetadata(preset.addMetadata);
    if (preset.embedSubtitles !== undefined) setEmbedSubtitles(preset.embedSubtitles);
  };

  // Start Download
  const handleStartDownload = async () => {
    if (!url.trim()) {
      setGeneralError('Please enter or paste a valid media URL.');
      return;
    }

    setIsStartingDownload(true);
    setGeneralError(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          title: videoMetadata?.title || 'Media Download',
          quality,
          format,
          destinationFolder,
          customFolder,
          audioBitrate,
          embedSubtitles,
          subtitlesLang,
          embedThumbnail,
          addMetadata,
          sponsorblock,
          rateLimit,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start download process.');
      }

      const jobId = data.jobId;

      // Listen via Server-Sent Events (SSE)
      const eventSource = new EventSource(`/api/download/${jobId}/stream`);

      eventSource.onmessage = (event) => {
        try {
          const jobData: DownloadJobState = JSON.parse(event.data);
          setActiveJob(jobData);

          if (jobData.status === 'completed') {
            eventSource.close();
            fetchLibrary();

            // Auto-trigger browser download if user checked the box
            if (autoBrowserDownload && jobData.filename) {
              const downloadUrl = `/api/files/${encodeURIComponent(jobData.filename)}?download=1`;
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.setAttribute('download', jobData.filename);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          } else if (jobData.status === 'error' || jobData.status === 'aborted') {
            eventSource.close();
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch (err: any) {
      setGeneralError(err.message || 'An error occurred starting download.');
    } finally {
      setIsStartingDownload(false);
    }
  };

  // Abort active job
  const handleAbortJob = async (jobId: string) => {
    try {
      await fetch(`/api/download/${jobId}/abort`, { method: 'POST' });
    } catch (e) {
      console.error('Failed to abort job:', e);
    }
  };

  // Delete file from library
  const handleDeleteFile = async (relativePath: string) => {
    try {
      const res = await fetch(`/api/files/${encodeURIComponent(relativePath)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLibraryFiles((prev) => prev.filter((f) => f.relativePath !== relativePath));
      }
    } catch (e) {
      console.error('Failed to delete file:', e);
    }
  };

  // Compute live CLI command
  const generatedCommand = buildCommandString({
    url,
    quality,
    format,
    destinationFolder,
    customFolder,
    audioBitrate,
    embedSubtitles,
    subtitlesLang,
    embedThumbnail,
    addMetadata,
    sponsorblock,
    rateLimit,
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-red-500/30 selection:text-white">
      {/* Top Bar adhering to 3-zone contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
        activeDownloadsCount={activeJob && ['downloading', 'processing', 'pending'].includes(activeJob.status) ? 1 : 0}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Active Download Progress Banner */}
        {activeJob && (
          <ActiveDownloadBanner
            job={activeJob}
            onAbort={handleAbortJob}
            onPlayFile={(filename) => setPlayingFilePath(filename)}
            onDismiss={() => setActiveJob(null)}
          />
        )}

        {/* Global Error Banner if any */}
        {generalError && (
          <div className="bg-red-950/60 border border-red-800 text-red-200 px-4 py-3 rounded-xl mb-6 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{generalError}</span>
            </div>
            <button
              onClick={() => setGeneralError(null)}
              className="text-neutral-400 hover:text-white text-xs ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: Downloader (Primary Flow) */}
        {activeTab === 'downloader' && (
          <div>
            {/* 1-Click Instant Presets */}
            <QuickPresetsBar
              onApplyPreset={handleApplyPreset}
              activeQuality={quality}
              activeFormat={format}
              activeFolder={destinationFolder}
            />

            {/* URL Input Bar */}
            <UrlBar
              url={url}
              onChangeUrl={setUrl}
              onInspect={handleInspect}
              isInspecting={isInspecting}
              onClear={() => {
                setUrl('');
                setVideoMetadata(null);
                setInspectError(null);
              }}
            />

            {/* Inspect Error notification */}
            {inspectError && (
              <div className="bg-amber-950/40 border border-amber-800/80 text-amber-200 px-4 py-3 rounded-xl mb-6 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Inspection notice: {inspectError}. You can still proceed with direct download.</span>
              </div>
            )}

            {/* Inspected Video Preview Card */}
            {videoMetadata && (
              <VideoPreviewCard
                metadata={videoMetadata}
                onClear={() => setVideoMetadata(null)}
              />
            )}

            {/* 1-Click Selectors Section */}
            <div className="space-y-4">
              {/* Quality Selector */}
              <QualitySelector
                selectedQuality={quality}
                onSelectQuality={setQuality}
                availableHeights={videoMetadata?.availableHeights}
              />

              {/* Format Selector */}
              <FormatSelector
                selectedFormat={format}
                onSelectFormat={setFormat}
                selectedQuality={quality}
                audioBitrate={audioBitrate}
                onSelectAudioBitrate={setAudioBitrate}
              />

              {/* Destination Folder Selector */}
              <FolderSelector
                selectedFolder={destinationFolder}
                onSelectFolder={setDestinationFolder}
                customPath={customFolder}
                onChangeCustomPath={setCustomFolder}
                autoBrowserDownload={autoBrowserDownload}
                onToggleAutoBrowserDownload={setAutoBrowserDownload}
              />

              {/* Advanced Flags */}
              <AdvancedOptions
                embedSubtitles={embedSubtitles}
                onToggleEmbedSubtitles={setEmbedSubtitles}
                subtitlesLang={subtitlesLang}
                onChangeSubtitlesLang={setSubtitlesLang}
                embedThumbnail={embedThumbnail}
                onToggleEmbedThumbnail={setEmbedThumbnail}
                addMetadata={addMetadata}
                onToggleAddMetadata={setAddMetadata}
                sponsorblock={sponsorblock}
                onToggleSponsorblock={setSponsorblock}
                rateLimit={rateLimit}
                onChangeRateLimit={setRateLimit}
                availableSubtitles={videoMetadata?.subtitles}
              />
            </div>

            {/* Primary Action Button Bar */}
            <div className="mt-8 p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-neutral-400">
                <div className="flex items-center gap-2 text-neutral-200 font-medium">
                  <span>Target:</span>
                  <span className="font-mono text-white">
                    {quality === 'audio-only' ? 'Audio Extraction' : `${quality}p`}
                  </span>
                  <span className="text-neutral-600">·</span>
                  <span className="font-mono text-white uppercase">{format}</span>
                  <span className="text-neutral-600">·</span>
                  <span className="font-mono text-white">
                    {destinationFolder === 'custom' && customFolder ? customFolder : `~/${destinationFolder}`}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-neutral-400">
                  Ready to download via yt-dlp core. Click to begin stream capture.
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleStartDownload}
                  disabled={!url.trim() || isStartingDownload || (activeJob?.status === 'downloading')}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950/40"
                >
                  {isStartingDownload ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initiating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Start Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Live Command preview at bottom */}
            <div className="mt-6 p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 truncate text-neutral-400">
                <Terminal className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="truncate">{generatedCommand}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('generator')}
                className="text-neutral-300 hover:text-white shrink-0 underline text-[11px]"
              >
                View Full CLI Script
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: 1-Click Presets Gallery */}
        {activeTab === 'presets' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Curated 1-Click Download Presets
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Pre-configured configurations for common workflows. Select any preset to configure quality, format, and folders instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRESETS.map((p) => (
                <div
                  key={p.id}
                  className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col justify-between hover:border-neutral-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold font-mono uppercase text-red-400">
                        {p.format} · {p.quality === 'audio-only' ? 'Audio' : `${p.quality}p`}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">
                        ~/{p.destination}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-neutral-100">{p.label}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{p.tagline}</p>

                    <div className="mt-4 pt-3 border-t border-neutral-800/80 text-xs text-neutral-400 space-y-1 font-mono">
                      <div>Format: {p.format.toUpperCase()}</div>
                      <div>Folder: {p.destination}</div>
                      <div>Artwork: {p.embedThumbnail ? 'Embedded' : 'None'}</div>
                      <div>Metadata: {p.addMetadata ? 'Auto-tagged' : 'None'}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleApplyPreset(p);
                      setActiveTab('downloader');
                    }}
                    className="mt-5 w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Apply & Go to Downloader</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CLI Generator */}
        {activeTab === 'generator' && (
          <CliCommandView
            commandString={generatedCommand}
            url={url}
            quality={quality}
            format={format}
            destinationFolder={destinationFolder}
            customFolder={customFolder}
            embedSubtitles={embedSubtitles}
            embedThumbnail={embedThumbnail}
            addMetadata={addMetadata}
            sponsorblock={sponsorblock}
          />
        )}

        {/* TAB 4: Media Library */}
        {activeTab === 'library' && (
          <DownloadsLibrary
            files={libraryFiles}
            isLoading={isLoadingLibrary}
            onRefresh={fetchLibrary}
            onPlay={(path) => setPlayingFilePath(path)}
            onDelete={handleDeleteFile}
            onGoToDownloader={() => setActiveTab('downloader')}
          />
        )}
      </main>

      {/* Media Player Modal */}
      {playingFilePath && (
        <MediaPlayerModal
          filePath={playingFilePath}
          onClose={() => setPlayingFilePath(null)}
        />
      )}

      {/* Clean quiet footer adhering to anti-slop guidelines */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <div>
            <span>yt-dlp GUI Frontend</span>
            <span className="mx-2">·</span>
            <span>Single-click quality, format & destination preset management</span>
          </div>
          <div className="font-mono text-[11px] text-neutral-400">
            Powered by yt-dlp & FFmpeg
          </div>
        </div>
      </footer>
    </div>
  );
}
