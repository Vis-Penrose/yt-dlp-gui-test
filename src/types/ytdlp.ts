export type VideoQuality = 'best' | '2160' | '1440' | '1080' | '720' | '480' | '360' | 'audio-only';

export type MediaFormat = 'mp4' | 'mkv' | 'webm' | 'mp3' | 'm4a' | 'flac' | 'wav' | 'opus';

export type FolderPreset = {
  id: string;
  name: string;
  path: string;
  description: string;
  iconType: 'download' | 'video' | 'music' | 'podcast' | 'archive' | 'custom';
};

export interface QuickPreset {
  id: string;
  label: string;
  tagline: string;
  quality: VideoQuality;
  format: MediaFormat;
  destination: string;
  audioBitrate?: string;
  embedThumbnail?: boolean;
  addMetadata?: boolean;
  embedSubtitles?: boolean;
}

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  uploader: string;
  thumbnail?: string;
  duration?: number;
  viewCount?: number;
  webpageUrl: string;
  uploadDate?: string;
  availableHeights: number[];
  subtitles: string[];
}

export interface DownloadJobState {
  id: string;
  url: string;
  title: string;
  quality: string;
  format: string;
  destinationFolder: string;
  status: 'pending' | 'downloading' | 'processing' | 'completed' | 'error' | 'aborted';
  percent: number;
  speed: string;
  eta: string;
  downloadedBytes: string;
  totalBytes: string;
  filename?: string;
  filePath?: string;
  fileSize?: number;
  error?: string;
  logs: string[];
  startTime: number;
  endTime?: number;
  commandString: string;
}

export interface DownloadedFile {
  filename: string;
  relativePath: string;
  folder: string;
  size: number;
  created: number;
  ext: string;
}

export interface SystemStatus {
  ok: boolean;
  ytDlpAvailable: boolean;
  ytDlpVersion: string;
  ffmpegAvailable: boolean;
  ffmpegVersion: string;
  downloadsDir: string;
  defaultFolders: Array<{ id: string; name: string; path: string; isDefault?: boolean }>;
}
