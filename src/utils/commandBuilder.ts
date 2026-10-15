import { VideoQuality, MediaFormat } from '../types/ytdlp';

export interface CommandOptions {
  url: string;
  quality: VideoQuality;
  format: MediaFormat;
  destinationFolder: string;
  customFolder?: string;
  audioBitrate?: string;
  embedSubtitles?: boolean;
  subtitlesLang?: string;
  embedThumbnail?: boolean;
  addMetadata?: boolean;
  sponsorblock?: boolean;
  rateLimit?: string;
}

export function buildCommandString(options: CommandOptions): string {
  const parts: string[] = ['yt-dlp'];
  const isAudioOnly = options.quality === 'audio-only' || ['mp3', 'm4a', 'flac', 'wav', 'opus'].includes(options.format);

  if (isAudioOnly) {
    parts.push('-x');
    parts.push(`--audio-format ${options.format || 'mp3'}`);
    if (options.audioBitrate) {
      parts.push(`--audio-quality ${options.audioBitrate}k`);
    } else {
      parts.push('--audio-quality 0');
    }
  } else {
    let filter = 'bestvideo+bestaudio/best';
    if (options.quality === '2160') filter = 'bestvideo[height<=2160]+bestaudio/best[height<=2160]/best';
    else if (options.quality === '1440') filter = 'bestvideo[height<=1440]+bestaudio/best[height<=1440]/best';
    else if (options.quality === '1080') filter = 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best';
    else if (options.quality === '720') filter = 'bestvideo[height<=720]+bestaudio/best[height<=720]/best';
    else if (options.quality === '480') filter = 'bestvideo[height<=480]+bestaudio/best[height<=480]/best';
    else if (options.quality === '360') filter = 'bestvideo[height<=360]+bestaudio/best[height<=360]/best';

    parts.push(`-f "${filter}"`);
    if (['mp4', 'mkv', 'webm'].includes(options.format)) {
      parts.push(`--merge-output-format ${options.format}`);
    }
  }

  if (options.embedThumbnail) {
    parts.push('--embed-thumbnail');
  }

  if (options.addMetadata) {
    parts.push('--add-metadata');
  }

  if (options.embedSubtitles) {
    parts.push('--write-subs');
    parts.push('--embed-subs');
    if (options.subtitlesLang && options.subtitlesLang !== 'all') {
      parts.push(`--sub-langs "${options.subtitlesLang}"`);
    }
  }

  if (options.sponsorblock) {
    parts.push('--sponsorblock-remove sponsor');
  }

  if (options.rateLimit && options.rateLimit !== 'unlimited') {
    parts.push(`--limit-rate ${options.rateLimit}`);
  }

  // Destination folder output template
  const folder = options.destinationFolder === 'custom' && options.customFolder
    ? options.customFolder
    : options.destinationFolder === 'downloads'
    ? '~/Downloads'
    : `~/Downloads/${options.destinationFolder.charAt(0).toUpperCase() + options.destinationFolder.slice(1)}`;

  parts.push(`-P "${folder}"`);
  parts.push('-o "%(title)s [%(id)s].%(ext)s"');

  const cleanUrl = options.url.trim() || 'https://www.youtube.com/watch?v=example';
  parts.push(`"${cleanUrl}"`);

  return parts.join(' ');
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds)) return '--:--';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function downloadAsFile(filename: string, content: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
