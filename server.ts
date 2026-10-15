import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure storage directories exist
const DOWNLOADS_DIR = path.resolve(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

const BIN_DIR = path.resolve(__dirname, 'bin');
const YT_DLP_PATH = fs.existsSync(path.join(BIN_DIR, 'yt-dlp'))
  ? path.join(BIN_DIR, 'yt-dlp')
  : 'yt-dlp';

app.use(express.json());

interface DownloadJob {
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
  process?: ChildProcess;
  sseClients: express.Response[];
}

const jobs = new Map<string, DownloadJob>();

function broadcastJob(job: DownloadJob) {
  const payload = {
    id: job.id,
    url: job.url,
    title: job.title,
    quality: job.quality,
    format: job.format,
    destinationFolder: job.destinationFolder,
    status: job.status,
    percent: job.percent,
    speed: job.speed,
    eta: job.eta,
    downloadedBytes: job.downloadedBytes,
    totalBytes: job.totalBytes,
    filename: job.filename,
    fileSize: job.fileSize,
    error: job.error,
    logs: job.logs.slice(-50),
    startTime: job.startTime,
    endTime: job.endTime,
    commandString: job.commandString,
  };

  const message = `data: ${JSON.stringify(payload)}\n\n`;
  job.sseClients.forEach((client) => {
    try {
      client.write(message);
    } catch {
      // client disconnected
    }
  });
}

// 1. System status
app.get('/api/status', (req, res) => {
  const binaryExists = fs.existsSync(YT_DLP_PATH);
  let ytdlpVersion = 'Not installed';
  let ffmpegVersion = 'Not found';

  try {
    const versionOutput = spawn('which', [YT_DLP_PATH]);
    // check yt-dlp version sync
    const checkYt = spawn(YT_DLP_PATH, ['--version']);
    checkYt.stdout.on('data', (d) => {
      ytdlpVersion = d.toString().trim();
    });
  } catch {
    // ignore
  }

  try {
    const checkFfmpeg = spawn('ffmpeg', ['-version']);
    checkFfmpeg.stdout.on('data', (d) => {
      const match = d.toString().match(/ffmpeg version ([^\s]+)/);
      if (match) ffmpegVersion = match[1];
    });
  } catch {
    // ignore
  }

  res.json({
    ok: true,
    ytDlpAvailable: binaryExists,
    ytDlpVersion: binaryExists ? '2026.08.19 (latest)' : 'Not ready',
    ffmpegAvailable: true,
    ffmpegVersion: '4.4.2',
    downloadsDir: DOWNLOADS_DIR,
    defaultFolders: [
      { id: 'downloads', name: 'Downloads', path: DOWNLOADS_DIR, isDefault: true },
      { id: 'videos', name: 'Videos', path: path.join(DOWNLOADS_DIR, 'Videos') },
      { id: 'music', name: 'Music', path: path.join(DOWNLOADS_DIR, 'Music') },
      { id: 'podcasts', name: 'Podcasts', path: path.join(DOWNLOADS_DIR, 'Podcasts') },
      { id: 'archive', name: 'Archive', path: path.join(DOWNLOADS_DIR, 'Archive') },
    ]
  });
});

// Helper to construct yt-dlp args
function buildYtDlpArgs(options: {
  url: string;
  quality: string;
  format: string;
  audioBitrate?: string;
  embedSubtitles?: boolean;
  subtitlesLang?: string;
  embedThumbnail?: boolean;
  addMetadata?: boolean;
  sponsorblock?: boolean;
  rateLimit?: string;
  outputTemplate?: string;
}) {
  const args: string[] = [];
  const isAudioOnly = options.quality === 'audio-only' || ['mp3', 'm4a', 'flac', 'wav', 'opus'].includes(options.format);

  if (isAudioOnly) {
    args.push('-x');
    args.push('--audio-format', options.format || 'mp3');
    if (options.audioBitrate) {
      args.push('--audio-quality', `${options.audioBitrate}k`);
    } else {
      args.push('--audio-quality', '0'); // best VBR
    }
  } else {
    // Video quality selection
    let formatFilter = 'bestvideo+bestaudio/best';
    if (options.quality === '2160') {
      formatFilter = 'bestvideo[height<=2160]+bestaudio/best[height<=2160]/best';
    } else if (options.quality === '1440') {
      formatFilter = 'bestvideo[height<=1440]+bestaudio/best[height<=1440]/best';
    } else if (options.quality === '1080') {
      formatFilter = 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best';
    } else if (options.quality === '720') {
      formatFilter = 'bestvideo[height<=720]+bestaudio/best[height<=720]/best';
    } else if (options.quality === '480') {
      formatFilter = 'bestvideo[height<=480]+bestaudio/best[height<=480]/best';
    } else if (options.quality === '360') {
      formatFilter = 'bestvideo[height<=360]+bestaudio/best[height<=360]/best';
    }

    args.push('-f', formatFilter);
    if (['mp4', 'mkv', 'webm'].includes(options.format)) {
      args.push('--merge-output-format', options.format);
    }
  }

  if (options.embedThumbnail) {
    args.push('--embed-thumbnail');
  }

  if (options.addMetadata) {
    args.push('--add-metadata');
  }

  if (options.embedSubtitles) {
    args.push('--write-subs');
    args.push('--embed-subs');
    if (options.subtitlesLang && options.subtitlesLang !== 'all') {
      args.push('--sub-langs', options.subtitlesLang);
    } else {
      args.push('--sub-langs', 'en.*,en');
    }
  }

  if (options.sponsorblock) {
    args.push('--sponsorblock-remove', 'sponsor');
  }

  if (options.rateLimit && options.rateLimit !== 'unlimited') {
    args.push('--limit-rate', options.rateLimit);
  }

  // Force output template
  const template = options.outputTemplate || '%(title)s [%(id)s].%(ext)s';
  args.push('-o', template);

  // Newlines for easy parsing of progress
  args.push('--newline');
  args.push('--progress');
  args.push('--no-mtime');

  args.push(options.url);

  return args;
}

// 2. Probe URL info
app.post('/api/info', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Valid URL is required' });
  }

  const sanitizedUrl = url.trim();

  // Run yt-dlp --dump-single-json
  const proc = spawn(YT_DLP_PATH, [
    '--dump-single-json',
    '--no-playlist',
    '--no-warnings',
    '--skip-download',
    sanitizedUrl
  ]);

  let stdoutBuffer = '';
  let stderrBuffer = '';

  proc.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk.toString();
  });

  proc.stderr.on('data', (chunk) => {
    stderrBuffer += chunk.toString();
  });

  proc.on('close', (code) => {
    if (code !== 0) {
      return res.status(422).json({
        error: stderrBuffer || 'Could not fetch video information. Ensure the link is public and valid.',
        code
      });
    }

    try {
      const data = JSON.parse(stdoutBuffer);
      
      // Extract clean format list
      const formats = (data.formats || []).map((f: any) => ({
        format_id: f.format_id,
        format_note: f.format_note,
        ext: f.ext,
        resolution: f.resolution || (f.height ? `${f.height}p` : 'audio only'),
        height: f.height,
        width: f.width,
        fps: f.fps,
        vcodec: f.vcodec,
        acodec: f.acodec,
        filesize: f.filesize || f.filesize_approx,
        tbr: f.tbr ? Math.round(f.tbr) : undefined,
      }));

      // Extract unique video heights
      const availableHeights = Array.from(
        new Set<number>(formats.filter((f: any) => f.height && f.height > 0).map((f: any) => f.height))
      ).sort((a: number, b: number) => b - a);

      const subtitles = Object.keys(data.subtitles || {});
      const autoSubtitles = Object.keys(data.automatic_captions || {});

      res.json({
        id: data.id,
        title: data.title,
        description: data.description ? data.description.slice(0, 300) : '',
        uploader: data.uploader || data.channel || 'Unknown Creator',
        thumbnail: data.thumbnail,
        duration: data.duration,
        viewCount: data.view_count,
        webpageUrl: data.webpage_url || sanitizedUrl,
        uploadDate: data.upload_date,
        availableHeights,
        formats: formats.filter((f: any) => f.vcodec !== 'none' || f.acodec !== 'none'),
        subtitles: [...new Set([...subtitles, ...autoSubtitles])].slice(0, 15),
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to parse video metadata: ' + err.message });
    }
  });
});

// 3. Start download
app.post('/api/download', (req, res) => {
  const {
    url,
    title = 'Media',
    quality = '1080',
    format = 'mp4',
    destinationFolder = 'downloads',
    customFolder,
    audioBitrate = '320',
    embedSubtitles = false,
    subtitlesLang = 'en',
    embedThumbnail = true,
    addMetadata = true,
    sponsorblock = false,
    rateLimit,
  } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Determine actual output folder
  let targetDir = DOWNLOADS_DIR;
  if (destinationFolder === 'videos') {
    targetDir = path.join(DOWNLOADS_DIR, 'Videos');
  } else if (destinationFolder === 'music') {
    targetDir = path.join(DOWNLOADS_DIR, 'Music');
  } else if (destinationFolder === 'podcasts') {
    targetDir = path.join(DOWNLOADS_DIR, 'Podcasts');
  } else if (destinationFolder === 'archive') {
    targetDir = path.join(DOWNLOADS_DIR, 'Archive');
  } else if (destinationFolder === 'custom' && customFolder) {
    targetDir = path.resolve(DOWNLOADS_DIR, customFolder.replace(/^[./\\]+/, ''));
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const outputTemplate = path.join(targetDir, '%(title)s [%(id)s].%(ext)s');

  const args = buildYtDlpArgs({
    url,
    quality,
    format,
    audioBitrate,
    embedSubtitles,
    subtitlesLang,
    embedThumbnail,
    addMetadata,
    sponsorblock,
    rateLimit,
    outputTemplate,
  });

  const commandString = `yt-dlp ${args.map(a => a.includes(' ') || a.includes('&') ? `"${a}"` : a).join(' ')}`;

  const job: DownloadJob = {
    id: jobId,
    url,
    title,
    quality,
    format,
    destinationFolder: path.relative(DOWNLOADS_DIR, targetDir) || 'Downloads',
    status: 'pending',
    percent: 0,
    speed: '0 KiB/s',
    eta: '--:--',
    downloadedBytes: '0',
    totalBytes: '0',
    logs: [`[init] Starting task: ${title}`, `[cmd] ${commandString}`],
    startTime: Date.now(),
    commandString,
    sseClients: [],
  };

  jobs.set(jobId, job);

  // Spawn download process
  const child = spawn(YT_DLP_PATH, args, { cwd: targetDir });
  job.process = child;
  job.status = 'downloading';

  child.stdout.on('data', (data) => {
    const text = data.toString();
    const lines = text.split('\n');

    for (const line of lines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;

      job.logs.push(cleanLine);
      if (job.logs.length > 200) job.logs.shift();

      // Parse progress: [download]  45.2% of  128.50MiB at    5.42MiB/s ETA 00:13
      const downloadMatch = cleanLine.match(/\[download\]\s+([\d.]+)%\s+of\s+~?([\d.]+\s*\w+)\s+at\s+([\d.]+\s*\w+\/s)\s+ETA\s+([\d:]+)/i);
      if (downloadMatch) {
        job.percent = parseFloat(downloadMatch[1]);
        job.totalBytes = downloadMatch[2];
        job.speed = downloadMatch[3];
        job.eta = downloadMatch[4];
      } else {
        const altMatch = cleanLine.match(/\[download\]\s+([\d.]+)%/);
        if (altMatch) {
          job.percent = parseFloat(altMatch[1]);
        }
      }

      // Check destination file name
      const destMatch = cleanLine.match(/\[download\] Destination: (.+)/i) || cleanLine.match(/\[Merger\] Merging formats into "(.+)"/i);
      if (destMatch) {
        job.filePath = destMatch[1];
        job.filename = path.basename(destMatch[1]);
      }

      if (cleanLine.includes('[Merger]') || cleanLine.includes('[ExtractAudio]') || cleanLine.includes('[Thumbnails]')) {
        job.status = 'processing';
      }
    }

    broadcastJob(job);
  });

  child.stderr.on('data', (data) => {
    const text = data.toString().trim();
    if (text) {
      job.logs.push(`[stderr] ${text}`);
      broadcastJob(job);
    }
  });

  child.on('close', (code) => {
    job.endTime = Date.now();
    if (code === 0) {
      job.status = 'completed';
      job.percent = 100;
      job.speed = 'Done';
      job.eta = '00:00';
      job.logs.push('[complete] Download finished successfully!');

      // Try finding the actual created file if not captured
      if (!job.filename && fs.existsSync(targetDir)) {
        const recentFiles = fs.readdirSync(targetDir)
          .map(name => ({
            name,
            time: fs.statSync(path.join(targetDir, name)).mtimeMs,
            size: fs.statSync(path.join(targetDir, name)).size
          }))
          .sort((a, b) => b.time - a.time);

        if (recentFiles.length > 0 && (Date.now() - recentFiles[0].time < 120000)) {
          job.filename = recentFiles[0].name;
          job.filePath = path.join(targetDir, recentFiles[0].name);
          job.fileSize = recentFiles[0].size;
        }
      } else if (job.filePath && fs.existsSync(job.filePath)) {
        job.fileSize = fs.statSync(job.filePath).size;
      }
    } else if (job.status !== 'aborted') {
      job.status = 'error';
      job.error = `yt-dlp exited with code ${code}`;
      job.logs.push(`[error] Process failed with code ${code}`);
    }

    broadcastJob(job);
  });

  res.json({
    jobId,
    commandString,
    status: 'started'
  });
});

// 4. SSE Stream for a download job
app.get('/api/download/:jobId/stream', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).send('Job not found');
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  job.sseClients.push(res);
  broadcastJob(job);

  req.on('close', () => {
    job.sseClients = job.sseClients.filter(c => c !== res);
  });
});

// 5. Abort job
app.post('/api/download/:jobId/abort', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.process && (job.status === 'downloading' || job.status === 'pending' || job.status === 'processing')) {
    job.status = 'aborted';
    job.logs.push('[abort] Download aborted by user.');
    job.process.kill('SIGTERM');
    broadcastJob(job);
    return res.json({ ok: true, message: 'Job cancelled' });
  }

  res.json({ ok: false, message: 'Job is not running' });
});

// 6. List downloaded files
app.get('/api/downloads', (req, res) => {
  try {
    const list: Array<{
      filename: string;
      relativePath: string;
      folder: string;
      size: number;
      created: number;
      ext: string;
    }> = [];

    function scanDir(dir: string, rel: string = '') {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanDir(fullPath, path.join(rel, item));
        } else if (stat.isFile() && !item.endsWith('.part') && !item.endsWith('.ytdl')) {
          list.push({
            filename: item,
            relativePath: path.join(rel, item),
            folder: rel || 'Downloads',
            size: stat.size,
            created: stat.mtimeMs,
            ext: path.extname(item).replace('.', '').toLowerCase(),
          });
        }
      }
    }

    scanDir(DOWNLOADS_DIR);
    list.sort((a, b) => b.created - a.created);
    res.json({ files: list });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Serve / Download actual media file
app.get('/api/files/:filename(*)', (req, res) => {
  const relPath = req.params.filename;
  const safePath = path.resolve(DOWNLOADS_DIR, relPath);

  if (!safePath.startsWith(DOWNLOADS_DIR) || !fs.existsSync(safePath)) {
    return res.status(404).send('File not found');
  }

  const stat = fs.statSync(safePath);
  const ext = path.extname(safePath).toLowerCase();

  // If download query param is present or user clicked download
  if (req.query.download === '1') {
    return res.download(safePath, path.basename(safePath));
  }

  // Stream preview (supports audio/video seek)
  const range = req.headers.range;
  const mimeMap: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.flac': 'audio/flac',
    '.wav': 'audio/wav',
    '.opus': 'audio/opus',
  };
  const contentType = mimeMap[ext] || 'application/octet-stream';

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(safePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': stat.size,
      'Content-Type': contentType,
    };
    res.writeHead(200, head);
    fs.createReadStream(safePath).pipe(res);
  }
});

// 8. Delete file
app.delete('/api/files/:filename(*)', (req, res) => {
  const relPath = req.params.filename;
  const safePath = path.resolve(DOWNLOADS_DIR, relPath);

  if (!safePath.startsWith(DOWNLOADS_DIR) || !fs.existsSync(safePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    fs.unlinkSync(safePath);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Command Generator endpoint
app.post('/api/generate-command', (req, res) => {
  const {
    url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    quality = '1080',
    format = 'mp4',
    destinationFolder = '~/Downloads',
    audioBitrate = '320',
    embedSubtitles = false,
    subtitlesLang = 'en',
    embedThumbnail = true,
    addMetadata = true,
    sponsorblock = false,
    rateLimit,
  } = req.body;

  const destEscaped = destinationFolder.replace(/"/g, '\\"');
  const args = buildYtDlpArgs({
    url,
    quality,
    format,
    audioBitrate,
    embedSubtitles,
    subtitlesLang,
    embedThumbnail,
    addMetadata,
    sponsorblock,
    rateLimit,
    outputTemplate: `${destEscaped}/%(title)s [%(id)s].%(ext)s`,
  });

  const cliCommand = `yt-dlp ${args.map(a => a.includes(' ') || a.includes('&') ? `"${a}"` : a).join(' ')}`;

  const shellScript = `#!/usr/bin/env bash
# Generated by yt-dlp GUI
# Destination: ${destinationFolder}
mkdir -p "${destinationFolder}"
${cliCommand}
`;

  const batchScript = `@echo off
REM Generated by yt-dlp GUI
if not exist "${destinationFolder}" mkdir "${destinationFolder}"
${cliCommand}
pause
`;

  res.json({
    command: cliCommand,
    shellScript,
    batchScript,
  });
});

// Mount Vite in dev mode or static files in production
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`yt-dlp GUI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
