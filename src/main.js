import './style.css';

document.querySelector('#app').innerHTML = `
  <main class="app-shell">
    <section class="hero" aria-labelledby="app-title">
      <p class="eyebrow">LOCAL SHORT-FORM TOOL</p>
      <h1 id="app-title">SHORTS</h1>
      <p class="intro">이미지와 음성, 자막으로 간단하게 숏폼을 만들어보세요.</p>
    </section>

    <section class="ffmpeg-status panel" aria-labelledby="ffmpeg-title">
      <div class="section-heading compact">
        <div><p class="step-label">LOCAL ENGINE</p><h2 id="ffmpeg-title">FFmpeg 연결</h2></div>
        <span class="format-note">Windows</span>
      </div>
      <div class="ffmpeg-check-row">
        <p class="ffmpeg-message" id="ffmpeg-message">FFmpeg 연결을 아직 확인하지 않았습니다.</p>
        <button class="check-button" id="ffmpeg-check" type="button">연결 확인</button>
      </div>
    </section>

    <form class="workspace" onsubmit="return false">
      <section class="panel image-panel" aria-labelledby="image-title">
        <div class="section-heading">
          <div><p class="step-label">01</p><h2 id="image-title">이미지</h2></div>
          <span class="format-note">JPG · PNG · WEBP</span>
        </div>
        <label class="upload-zone" for="image-input">
          <span class="upload-icon" aria-hidden="true">＋</span>
          <span class="upload-title">이미지를 추가하세요</span>
          <span class="upload-description">여러 장을 선택할 수 있습니다</span>
          <input id="image-input" type="file" accept="image/jpeg,image/png,image/webp" multiple />
        </label>
        <div class="list-header"><span>이미지 목록 <span class="image-count">0장</span></span><span class="muted">순서대로 재생됩니다</span></div>
        <div class="image-list empty-state" aria-live="polite"><span class="empty-icon" aria-hidden="true">▧</span><span>추가된 이미지가 없습니다</span></div>
      </section>

      <div class="input-grid">
        <section class="panel file-panel" aria-labelledby="audio-title">
          <div class="section-heading compact"><div><p class="step-label">02</p><h2 id="audio-title">음성</h2></div><span class="format-note">WAV · MP3</span></div>
          <div class="file-picker-row">
            <label class="file-select" for="audio-input"><span class="file-icon" aria-hidden="true">♫</span><span id="audio-picker-text">음성 파일 선택</span><input id="audio-input" type="file" accept="audio/wav,audio/mpeg,.wav,.mp3" /></label>
            <button class="clear-file" id="audio-clear" type="button" aria-label="선택한 음성 파일 삭제" hidden>×</button>
          </div>
          <p class="selected-file" id="audio-file-info">선택된 파일 없음</p>
        </section>
        <section class="panel file-panel" aria-labelledby="subtitle-title">
          <div class="section-heading compact"><div><p class="step-label">03</p><h2 id="subtitle-title">자막</h2></div><span class="format-note">SRT</span></div>
          <div class="file-picker-row">
            <label class="file-select" for="subtitle-input"><span class="file-icon" aria-hidden="true">Aa</span><span id="subtitle-picker-text">SRT 파일 선택</span><input id="subtitle-input" type="file" accept=".srt,application/x-subrip" /></label>
            <button class="clear-file" id="subtitle-clear" type="button" aria-label="선택한 SRT 파일 삭제" hidden>×</button>
          </div>
          <p class="selected-file" id="subtitle-file-info">선택된 파일 없음</p>
        </section>
        <section class="panel file-panel bgm-panel" aria-labelledby="bgm-title">
          <div class="section-heading compact"><div><p class="step-label">04</p><h2 id="bgm-title">배경음악</h2></div><span class="format-note">WAV · MP3</span></div>
          <div class="file-picker-row">
            <label class="file-select" for="bgm-input"><span class="file-icon" aria-hidden="true">♫</span><span id="bgm-picker-text">배경음악 파일 선택</span><input id="bgm-input" type="file" accept="audio/wav,audio/mpeg,.wav,.mp3" /></label>
            <button class="clear-file" id="bgm-clear" type="button" aria-label="선택한 배경음악 파일 삭제" hidden>×</button>
          </div>
          <p class="selected-file" id="bgm-file-info">선택된 파일 없음</p>
        </section>
      </div>

      <button class="create-button" id="create-video" type="button">영상 만들기 <span aria-hidden="true">→</span></button>

      <section class="panel progress-panel" aria-labelledby="progress-title">
        <div class="section-heading compact"><h2 id="progress-title">진행 상태</h2><span class="status-badge" id="progress-status">대기 중</span></div>
        <div class="progress-track" aria-label="진행률 0%"><span id="progress-bar"></span></div>
        <p class="progress-message" id="progress-message">파일을 선택하면 영상 제작을 시작할 수 있습니다.</p>
      </section>

      <section class="panel preview-panel" aria-labelledby="preview-title">
        <div class="section-heading compact"><h2 id="preview-title">완성 영상 미리보기</h2><span class="format-note">MP4 · 9:16</span></div>
        <div class="video-placeholder" id="video-preview"><span class="play-icon" aria-hidden="true">▶</span><span>완성된 영상이 여기에 표시됩니다</span></div>
        <button class="save-button" id="save-video" type="button" disabled>MP4 저장</button>
      </section>
    </form>
  </main>
`;

const imageInput = document.querySelector('#image-input');
const imageList = document.querySelector('.image-list');
const imageCount = document.querySelector('.image-count');
const supportedImageExtensions = /\.(jpe?g|png|webp)$/i;
let selectedImages = [];

function isSupportedImage(file) {
  const supportedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return supportedMimeTypes.includes(file.type) || supportedImageExtensions.test(file.name);
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character]);
}

function renderImageList() {
  imageCount.textContent = `${selectedImages.length}장`;

  if (selectedImages.length === 0) {
    imageList.className = 'image-list empty-state';
    imageList.innerHTML = '<span class="empty-icon" aria-hidden="true">▧</span><span>추가된 이미지가 없습니다</span>';
    return;
  }

  imageList.className = 'image-list';
  imageList.innerHTML = selectedImages.map((image, index) => `
    <div class="image-item">
      <span class="image-order">${String(index + 1).padStart(2, '0')}</span>
      <button class="remove-image" type="button" data-image-index="${index}" aria-label="${escapeHtml(image.file.name)} 삭제">×</button>
      <img src="${image.url}" alt="${escapeHtml(image.file.name)}" />
      <span class="image-name" title="${escapeHtml(image.file.name)}">${escapeHtml(image.file.name)}</span>
    </div>
  `).join('');
}

imageInput.addEventListener('change', (event) => {
  const files = Array.from(event.target.files);
  const validImages = files.filter(isSupportedImage);

  selectedImages.push(...validImages.map((file) => ({
    file,
    url: URL.createObjectURL(file),
  })));

  renderImageList();

  // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 입력값을 비운다.
  event.target.value = '';
});

imageList.addEventListener('click', (event) => {
  const removeButton = event.target.closest('.remove-image');
  if (!removeButton) return;

  const imageIndex = Number(removeButton.dataset.imageIndex);
  const [removedImage] = selectedImages.splice(imageIndex, 1);

  if (removedImage) {
    URL.revokeObjectURL(removedImage.url);
    renderImageList();
  }
});

const audioInput = document.querySelector('#audio-input');
const audioPickerText = document.querySelector('#audio-picker-text');
const audioFileInfo = document.querySelector('#audio-file-info');
const audioClear = document.querySelector('#audio-clear');
const supportedAudioExtensions = /\.(wav|mp3)$/i;
let selectedAudioFile = null;

function isSupportedAudio(file) {
  return ['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp3'].includes(file.type)
    || supportedAudioExtensions.test(file.name);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(fileName) {
  return fileName.includes('.') ? fileName.split('.').pop().toUpperCase() : '알 수 없음';
}

function renderAudioFile() {
  if (!selectedAudioFile) {
    audioPickerText.textContent = '음성 파일 선택';
    audioFileInfo.textContent = '선택된 파일 없음';
    audioClear.hidden = true;
    return;
  }

  audioPickerText.textContent = '다른 음성 파일 선택';
  audioFileInfo.textContent = `${selectedAudioFile.name} · ${getFileExtension(selectedAudioFile.name)} · ${formatFileSize(selectedAudioFile.size)}`;
  audioClear.hidden = false;
}

audioInput.addEventListener('change', (event) => {
  const [file] = Array.from(event.target.files);

  if (file && isSupportedAudio(file)) {
    selectedAudioFile = file;
    renderAudioFile();
  }

  // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 입력값을 비운다.
  event.target.value = '';
});

audioClear.addEventListener('click', () => {
  selectedAudioFile = null;
  audioInput.value = '';
  renderAudioFile();
});

const subtitleInput = document.querySelector('#subtitle-input');
const subtitlePickerText = document.querySelector('#subtitle-picker-text');
const subtitleFileInfo = document.querySelector('#subtitle-file-info');
const subtitleClear = document.querySelector('#subtitle-clear');
const supportedSubtitleExtension = /\.srt$/i;
let selectedSubtitleFile = null;

function isSupportedSubtitle(file) {
  return supportedSubtitleExtension.test(file.name);
}

function renderSubtitleFile() {
  if (!selectedSubtitleFile) {
    subtitlePickerText.textContent = 'SRT 파일 선택';
    subtitleFileInfo.textContent = '선택된 파일 없음';
    subtitleClear.hidden = true;
    return;
  }

  subtitlePickerText.textContent = '다른 SRT 파일 선택';
  subtitleFileInfo.textContent = `${selectedSubtitleFile.name} · ${getFileExtension(selectedSubtitleFile.name)} · ${formatFileSize(selectedSubtitleFile.size)}`;
  subtitleClear.hidden = false;
}

subtitleInput.addEventListener('change', (event) => {
  const [file] = Array.from(event.target.files);

  if (file && isSupportedSubtitle(file)) {
    selectedSubtitleFile = file;
    renderSubtitleFile();
  }

  // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 입력값을 비운다.
  event.target.value = '';
});

subtitleClear.addEventListener('click', () => {
  selectedSubtitleFile = null;
  subtitleInput.value = '';
  renderSubtitleFile();
});

const ffmpegCheck = document.querySelector('#ffmpeg-check');
const ffmpegMessage = document.querySelector('#ffmpeg-message');

ffmpegCheck.addEventListener('click', async () => {
  ffmpegCheck.disabled = true;
  ffmpegMessage.className = 'ffmpeg-message checking';
  ffmpegMessage.textContent = 'FFmpeg 연결을 확인하는 중입니다...';

  try {
    const response = await fetch('/api/ffmpeg/version');
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.error || 'FFmpeg를 실행할 수 없습니다.');
    }

    ffmpegMessage.className = 'ffmpeg-message success';
    ffmpegMessage.textContent = result.version;
  } catch (error) {
    ffmpegMessage.className = 'ffmpeg-message error';
    ffmpegMessage.textContent = error.message;
  } finally {
    ffmpegCheck.disabled = false;
  }
});

const bgmInput = document.querySelector('#bgm-input');
const bgmPickerText = document.querySelector('#bgm-picker-text');
const bgmFileInfo = document.querySelector('#bgm-file-info');
const bgmClear = document.querySelector('#bgm-clear');
const supportedBgmExtensions = /\.(wav|mp3)$/i;
let selectedBgmFile = null;

function isSupportedBgm(file) {
  return ['audio/wav', 'audio/x-wav', 'audio/mpeg', 'audio/mp3'].includes(file.type)
    || supportedBgmExtensions.test(file.name);
}

function renderBgmFile() {
  if (!selectedBgmFile) {
    bgmPickerText.textContent = '배경음악 파일 선택';
    bgmFileInfo.textContent = '선택된 파일 없음';
    bgmClear.hidden = true;
    return;
  }

  bgmPickerText.textContent = '다른 배경음악 선택';
  bgmFileInfo.textContent = `${selectedBgmFile.name} · ${getFileExtension(selectedBgmFile.name)} · ${formatFileSize(selectedBgmFile.size)}`;
  bgmClear.hidden = false;
}

bgmInput.addEventListener('change', (event) => {
  const [file] = Array.from(event.target.files);

  if (file && isSupportedBgm(file)) {
    selectedBgmFile = file;
    renderBgmFile();
  }

  // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 입력값을 비운다.
  event.target.value = '';
});

bgmClear.addEventListener('click', () => {
  selectedBgmFile = null;
  bgmInput.value = '';
  renderBgmFile();
});

const createVideoButton = document.querySelector('#create-video');
const progressStatus = document.querySelector('#progress-status');
const progressBar = document.querySelector('#progress-bar');
const progressMessage = document.querySelector('#progress-message');
const videoPreview = document.querySelector('#video-preview');
const saveVideoButton = document.querySelector('#save-video');
let generatedVideoUrl = '';

function setProgress(status, message, percent) {
  progressStatus.textContent = status;
  progressMessage.textContent = message;
  progressBar.style.width = `${percent}%`;
  progressBar.parentElement.setAttribute('aria-label', `진행률 ${percent}%`);
}

createVideoButton.addEventListener('click', async () => {
  if (!selectedImages.length) {
    setProgress('실패', '이미지 1장을 먼저 선택해 주세요.', 0);
    return;
  }
  if (!selectedAudioFile) {
    setProgress('실패', '성우 음성 파일을 먼저 선택해 주세요.', 0);
    return;
  }

  createVideoButton.disabled = true;
  saveVideoButton.disabled = true;
  setProgress('파일 준비 중', '이미지와 성우 음성을 준비하는 중입니다.', 10);
  const stages = [
    ['성우 길이 분석 중', 'ffprobe로 성우 음성 길이를 확인하는 중입니다.', 25],
    ['이미지 장면 생성 중', '이미지별 노출 시간을 계산하는 중입니다.', 45],
    ['이미지 연결 중', '선택 순서대로 이미지를 연결하는 중입니다.', 65],
    ['성우 음성 삽입 중', '성우 음성을 영상에 삽입하는 중입니다.', 82],
  ];
  if (selectedSubtitleFile) {
    stages.push(['자막 Burn-in 중', '선택한 SRT 자막을 영상에 표시하는 중입니다.', 91]);
  }
  if (selectedBgmFile) {
    stages.push(['BGM 믹싱 중', '선택한 배경음악을 성우 음성과 믹싱하는 중입니다.', 94]);
  }
  let stageIndex = 0;
  const stageTimer = setInterval(() => {
    const [status, message, percent] = stages[stageIndex % stages.length];
    setProgress(status, message, percent);
    stageIndex += 1;
  }, 700);

  try {
    const formData = new FormData();
    selectedImages.forEach((image) => formData.append('images', image.file, image.file.name));
    formData.append('narration', selectedAudioFile, selectedAudioFile.name);
    if (selectedSubtitleFile) formData.append('subtitle', selectedSubtitleFile, selectedSubtitleFile.name);
    if (selectedBgmFile) formData.append('bgm', selectedBgmFile, selectedBgmFile.name);
    const response = await fetch('/api/render/slideshow', { method: 'POST', body: formData });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || '영상 생성에 실패했습니다.');

    generatedVideoUrl = result.videoUrl;
    videoPreview.innerHTML = `<video controls playsinline preload="metadata" src="${generatedVideoUrl}"></video>`;
    saveVideoButton.disabled = false;
    setProgress('완료', '5초 세로형 MP4가 생성되었습니다.', 100);
  } catch (error) {
    setProgress('실패', error.message, 0);
  } finally {
    clearInterval(stageTimer);
    createVideoButton.disabled = false;
  }
});

saveVideoButton.addEventListener('click', () => {
  if (!generatedVideoUrl) return;
  const link = document.createElement('a');
  link.href = generatedVideoUrl;
  link.download = 'shorts-step8.mp4';
  link.click();
});
