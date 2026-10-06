import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { defineConfig } from 'vite';

const generatedVideos = new Map();
const supportedImageExtensions = /\.(jpe?g|png|webp)$/i;

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function runFfmpegVersion() {
  return new Promise((resolve) => {
    const child = spawn('ffmpeg', ['-version'], { windowsHide: true });
    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve(result);
    };

    const timeout = setTimeout(() => {
      child.kill();
      finish({ ok: false, error: 'FFmpeg 실행 시간이 초과되었습니다.' });
    }, 5000);

    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        finish({ ok: false, error: 'FFmpeg를 찾을 수 없습니다. FFmpeg 설치 후 Windows PATH에 추가해 주세요.' });
        return;
      }
      finish({ ok: false, error: `FFmpeg 실행 오류: ${error.message}` });
    });
    child.on('close', (code) => {
      if (code === 0) {
        const version = (stdout || stderr).split(/\r?\n/, 1)[0].trim();
        finish({ ok: true, version });
        return;
      }
      finish({ ok: false, error: (stderr || stdout).trim() || `FFmpeg가 코드 ${code}으로 종료되었습니다.` });
    });
  });
}

async function ffmpegVersionMiddleware(_req, res) {
  const result = await runFfmpegVersion();
  sendJson(res, result.ok ? 200 : 503, result);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseImagePart(body, contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) throw new Error('이미지 업로드 형식을 확인할 수 없습니다.');

  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'));
  if (headerEnd === -1) throw new Error('업로드된 이미지 데이터를 확인할 수 없습니다.');

  const headers = body.subarray(0, headerEnd).toString('utf8');
  const filenameMatch = headers.match(/filename="([^"]*)"/i);
  const filename = filenameMatch?.[1] || 'input-image';
  const fileStart = headerEnd + 4;
  const nextBoundary = body.indexOf(boundaryBuffer, fileStart);
  if (nextBoundary === -1) throw new Error('업로드된 이미지의 끝을 확인할 수 없습니다.');

  const fileEnd = nextBoundary >= 2 ? nextBoundary - 2 : nextBoundary;
  const file = body.subarray(fileStart, fileEnd);
  const extension = path.extname(filename).toLowerCase();
  if (!supportedImageExtensions.test(filename)) {
    throw new Error('JPG, JPEG, PNG, WEBP 이미지만 사용할 수 있습니다.');
  }
  if (file.length === 0) throw new Error('이미지 파일이 비어 있습니다.');

  return { extension, file };
}

function parseMultipartParts(body, contentType) {
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) throw new Error('업로드 형식을 확인할 수 없습니다.');

  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const parts = [];
  let cursor = body.indexOf(boundaryBuffer);

  while (cursor !== -1) {
    const partStart = cursor + boundaryBuffer.length;
    if (body.subarray(partStart, partStart + 2).toString() === '--') break;

    const contentStart = partStart + 2;
    const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'), contentStart);
    if (headerEnd === -1) break;

    const headers = body.subarray(contentStart, headerEnd).toString('utf8');
    const nameMatch = headers.match(/name="([^"]+)"/i);
    const filenameMatch = headers.match(/filename="([^"]*)"/i);
    const fileStart = headerEnd + 4;
    const nextBoundary = body.indexOf(boundaryBuffer, fileStart);
    if (nextBoundary === -1) break;

    const fileEnd = nextBoundary >= 2 ? nextBoundary - 2 : nextBoundary;
    parts.push({
      fieldName: nameMatch?.[1] || '',
      filename: filenameMatch?.[1] || '',
      file: body.subarray(fileStart, fileEnd),
    });
    cursor = nextBoundary;
  }

  return parts;
}

function runFfmpeg(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-loop', '1',
      '-i', inputPath,
      '-t', '5',
      '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920',
      '-r', '30',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      outputPath,
    ];
    const child = spawn('ffmpeg', args, { windowsHide: true });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error('FFmpeg를 찾을 수 없습니다. Windows PATH를 확인해 주세요.'));
        return;
      }
      reject(new Error(`FFmpeg 실행 오류: ${error.message}`));
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr.trim() || `FFmpeg가 코드 ${code}으로 종료되었습니다.`));
    });
  });
}

function runFfprobeDuration(audioPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      audioPath,
    ], { windowsHide: true });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error('ffprobe를 찾을 수 없습니다. FFmpeg 설치와 Windows PATH를 확인해 주세요.'));
        return;
      }
      reject(new Error(`ffprobe 실행 오류: ${error.message}`));
    });
    child.on('close', (code) => {
      const duration = Number.parseFloat(stdout.trim());
      if (code === 0 && Number.isFinite(duration) && duration > 0) {
        resolve(duration);
        return;
      }
      reject(new Error(stderr.trim() || '성우 음성 길이를 확인할 수 없습니다.'));
    });
  });
}

function runFfmpegSlideshow(inputPaths, audioPath, bgmPath, outputPath, durations, audioDuration, subtitleFilename, workingDirectory) {
  return new Promise((resolve, reject) => {
    const args = ['-y'];
    inputPaths.forEach((inputPath) => {
      args.push('-loop', '1', '-framerate', '30', '-i', inputPath);
    });
    args.push('-i', audioPath);
    if (bgmPath) args.push('-stream_loop', '-1', '-i', bgmPath);

    const motionFilters = ['zoom-in', 'pan-left', 'zoom-out', 'pan-right'];
    const filters = inputPaths.map((_, index) => {
      const duration = durations[index].toFixed(6);
      const motion = motionFilters[index % motionFilters.length];
      const progress = `min(on/(30*${duration})\\,1)`;
      let zoompan;
      if (motion === 'zoom-in') {
        zoompan = `zoompan=z='1+${progress}*0.12':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d=1:s=1080x1920:fps=30`;
      } else if (motion === 'zoom-out') {
        zoompan = `zoompan=z='1.12-${progress}*0.12':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d=1:s=1080x1920:fps=30`;
      } else if (motion === 'pan-left') {
        zoompan = `zoompan=z='1.08':x='(iw-iw/zoom)*${progress}':y='(ih-ih/zoom)/2':d=1:s=1080x1920:fps=30`;
      } else {
        zoompan = `zoompan=z='1.08':x='(iw-iw/zoom)*(1-${progress})':y='(ih-ih/zoom)/2':d=1:s=1080x1920:fps=30`;
      }
      return `[${index}:v]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,setsar=1,${zoompan},trim=duration=${duration},setpts=PTS-STARTPTS[v${index}]`;
    });
    const concatInputs = inputPaths.map((_, index) => `[v${index}]`).join('');
    filters.push(`${concatInputs}concat=n=${inputPaths.length}:v=1:a=0[${subtitleFilename ? 'joined' : 'vout'}]`);
    if (subtitleFilename) {
      filters.push(`[joined]subtitles=filename='${subtitleFilename}':force_style='FontName=Gmarket Sans TTF Bold,FontSize=18,Alignment=2,MarginV=90,Outline=3,OutlineColour=&H00000000,PrimaryColour=&H00FFFFFF'[vout]`);
    }

    const audioMap = bgmPath ? '[aout]' : `${inputPaths.length}:a:0`;
    if (bgmPath) {
      const bgmInputIndex = inputPaths.length + 1;
      filters.push(`[${bgmInputIndex}:a]volume=0.10[bgm];[${inputPaths.length}:a][bgm]amix=inputs=2:duration=first:dropout_transition=0[aout]`);
    }

    args.push(
      '-filter_complex', `${filters.join(';')}`,
      '-map', '[vout]',
      '-map', audioMap,
      '-t', audioDuration.toFixed(6),
      '-r', '30',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', '+faststart',
      outputPath,
    );

    const child = spawn('ffmpeg', args, { windowsHide: true, cwd: workingDirectory });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error('FFmpeg를 찾을 수 없습니다. Windows PATH를 확인해 주세요.'));
        return;
      }
      reject(new Error(`FFmpeg 실행 오류: ${error.message}`));
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr.trim() || `FFmpeg가 코드 ${code}으로 종료되었습니다.`));
    });
  });
}

async function renderImageMiddleware(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'POST 요청만 지원합니다.' });
    return;
  }

  let workDir;
  try {
    const contentType = req.headers['content-type'] || '';
    const body = await readRequestBody(req);
    const image = parseImagePart(body, contentType);
    const token = randomUUID();
    workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'shorts-step8-'));
    const inputPath = path.join(workDir, `input-${token}${image.extension}`);
    const outputPath = path.join(workDir, `output-${token}.mp4`);

    await fs.writeFile(inputPath, image.file);
    await runFfmpeg(inputPath, outputPath);
    await fs.rm(inputPath, { force: true });

    generatedVideos.set(token, { outputPath });
    setTimeout(async () => {
      const generated = generatedVideos.get(token);
      generatedVideos.delete(token);
      if (generated) await fs.rm(path.dirname(generated.outputPath), { recursive: true, force: true });
    }, 60 * 60 * 1000).unref();

    sendJson(res, 200, { ok: true, videoUrl: `/api/render/result/${token}` });
  } catch (error) {
    if (workDir) await fs.rm(workDir, { recursive: true, force: true });
    sendJson(res, 400, { ok: false, error: error.message });
  }
}

async function renderSlideshowMiddleware(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'POST 요청만 지원합니다.' });
    return;
  }

  let workDir;
  try {
    const body = await readRequestBody(req);
    const parts = parseMultipartParts(body, req.headers['content-type'] || '');
    const imageParts = parts.filter((part) => part.fieldName === 'images');
    const narrationPart = parts.find((part) => part.fieldName === 'narration');
    const subtitlePart = parts.find((part) => part.fieldName === 'subtitle');
    const bgmPart = parts.find((part) => part.fieldName === 'bgm');
    if (!imageParts.length) throw new Error('이미지를 한 장 이상 선택해 주세요.');
    if (!narrationPart?.file?.length) throw new Error('성우 음성 파일을 선택해 주세요.');
    if (!supportedImageExtensions.test(imageParts[0].filename)) throw new Error('JPG, JPEG, PNG, WEBP 이미지만 사용할 수 있습니다.');
    if (!/\.(wav|mp3)$/i.test(narrationPart.filename)) throw new Error('성우 음성은 WAV 또는 MP3 파일만 사용할 수 있습니다.');
    if (subtitlePart?.file?.length && !/\.srt$/i.test(subtitlePart.filename)) throw new Error('자막은 SRT 파일만 사용할 수 있습니다.');

    if (bgmPart?.file?.length && !/\.(wav|mp3)$/i.test(bgmPart.filename)) throw new Error('BGM은 WAV 또는 MP3 파일만 사용할 수 있습니다.');

    const token = randomUUID();
    workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'shorts-step9-'));
    const imagePaths = [];
    for (const [index, imagePart] of imageParts.entries()) {
      if (!supportedImageExtensions.test(imagePart.filename)) throw new Error('JPG, JPEG, PNG, WEBP 이미지만 사용할 수 있습니다.');
      const imagePath = path.join(workDir, `input-image-${index + 1}-${token}${path.extname(imagePart.filename).toLowerCase()}`);
      await fs.writeFile(imagePath, imagePart.file);
      imagePaths.push(imagePath);
    }
    const audioPath = path.join(workDir, `input-narration-${token}${path.extname(narrationPart.filename).toLowerCase()}`);
    const bgmPath = bgmPart?.file?.length
      ? path.join(workDir, `input-bgm-${token}${path.extname(bgmPart.filename).toLowerCase()}`)
      : null;
    const outputPath = path.join(workDir, `output-${token}.mp4`);
    const subtitleFilename = subtitlePart?.file?.length ? `input-subtitle-${token}.srt` : null;
    const subtitlePath = subtitleFilename ? path.join(workDir, subtitleFilename) : null;
    await fs.writeFile(audioPath, narrationPart.file);
    if (bgmPath) await fs.writeFile(bgmPath, bgmPart.file);
    if (subtitlePath) await fs.writeFile(subtitlePath, subtitlePart.file);

    const audioDuration = await runFfprobeDuration(audioPath);
    const baseDuration = audioDuration / imagePaths.length;
    const durations = imagePaths.map((_, index) => index === imagePaths.length - 1
      ? audioDuration - baseDuration * (imagePaths.length - 1)
      : baseDuration);
    await runFfmpegSlideshow(imagePaths, audioPath, bgmPath, outputPath, durations, audioDuration, subtitleFilename, workDir);
    await Promise.all([...imagePaths, audioPath, ...(bgmPath ? [bgmPath] : []), ...(subtitlePath ? [subtitlePath] : [])].map((filePath) => fs.rm(filePath, { force: true })));

    generatedVideos.set(token, { outputPath });
    setTimeout(async () => {
      const generated = generatedVideos.get(token);
      generatedVideos.delete(token);
      if (generated) await fs.rm(path.dirname(generated.outputPath), { recursive: true, force: true });
    }, 60 * 60 * 1000).unref();

    sendJson(res, 200, { ok: true, audioDuration, durations, subtitleUsed: Boolean(subtitlePath), bgmUsed: Boolean(bgmPath), videoUrl: `/api/render/result/${token}` });
  } catch (error) {
    if (workDir) await fs.rm(workDir, { recursive: true, force: true });
    sendJson(res, 400, { ok: false, error: error.message });
  }
}

async function renderResultMiddleware(req, res) {
  const token = (req.url || '').split('?')[0].replace(/^\//, '');
  const generated = generatedVideos.get(token);
  if (!generated) {
    sendJson(res, 404, { ok: false, error: '생성된 영상을 찾을 수 없습니다.' });
    return;
  }

  try {
    const video = await fs.readFile(generated.outputPath);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', video.length);
    res.setHeader('Content-Disposition', 'inline; filename="shorts-step8.mp4"');
    res.end(video);
  } catch {
    generatedVideos.delete(token);
    sendJson(res, 404, { ok: false, error: '생성된 영상 파일을 읽을 수 없습니다.' });
  }
}

function shortsRenderPlugin() {
  return {
    name: 'shorts-step8-render-api',
    configureServer(server) {
      server.middlewares.use('/api/ffmpeg/version', ffmpegVersionMiddleware);
      server.middlewares.use('/api/render/image', renderImageMiddleware);
      server.middlewares.use('/api/render/slideshow', renderSlideshowMiddleware);
      server.middlewares.use('/api/render/result', renderResultMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/ffmpeg/version', ffmpegVersionMiddleware);
      server.middlewares.use('/api/render/image', renderImageMiddleware);
      server.middlewares.use('/api/render/slideshow', renderSlideshowMiddleware);
      server.middlewares.use('/api/render/result', renderResultMiddleware);
    },
  };
}

export default defineConfig({
  plugins: [shortsRenderPlugin()],
});
