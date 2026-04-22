let videos = [];       // { url, thumb, desc, id }
let isRunning = false;
let activeTabId = null;

// ── DOM refs ──
const btnStart     = document.getElementById('btnStart');
const btnClear     = document.getElementById('btnClear');
const btnDlAll     = document.getElementById('btnDlAll');
const statusIcon   = document.getElementById('statusIcon');
const statusTitle  = document.getElementById('statusTitle');
const statusDesc   = document.getElementById('statusDesc');
const progressWrap = document.getElementById('progressWrap');
const progressLabel= document.getElementById('progressLabel');
const progressCount= document.getElementById('progressCount');
const bar          = document.getElementById('bar');
const warning      = document.getElementById('warning');
const videoList    = document.getElementById('videoList');
const emptyState   = document.getElementById('emptyState');
const listHeader   = document.getElementById('listHeader');
const badge        = document.getElementById('badge');
const dlAllBar     = document.getElementById('dlAllBar');

// ── Helpers ──
function setStatus(icon, title, desc) {
  statusIcon.textContent  = icon;
  statusTitle.textContent = title;
  statusDesc.textContent  = desc;
}

function updateProgress(count) {
  progressWrap.style.display = 'block';
  progressCount.textContent  = `${count} video`;
  bar.style.width = Math.min(95, 10 + (count % 40) * 2.1) + '%';
}

function sanitizeFilename(str) {
  return str.replace(/[\\/:*?"<>|]/g, '_').substring(0, 60).trim() || 'video';
}

// ── Render a single card ──
function renderCard(v, index) {
  const card = document.createElement('div');
  card.className = 'video-card';
  card.id = `card-${v.id}`;

  const thumbHtml = v.thumb
    ? `<img src="${v.thumb}" alt="" loading="lazy" />`
    : `<div class="thumb-placeholder">🎬</div>`;

  card.innerHTML = `
    <div class="thumb-wrap">
      ${thumbHtml}
      <div class="thumb-num">#${index + 1}</div>
    </div>
    <div class="card-body">
      <div class="card-desc ${v.desc ? '' : 'empty'}">${v.desc || 'Không có mô tả'}</div>
      <div class="card-actions">
        <button class="btn-dl" data-id="${v.id}" data-url="${v.url}" data-desc="${sanitizeFilename(v.desc || v.id)}">
          ⬇ Tải xuống
        </button>
      </div>
    </div>
  `;

  card.querySelector('.btn-dl').addEventListener('click', (e) => {
    downloadSingle(e.currentTarget);
  });

  return card;
}

// ── Append new cards (incremental) ──
let renderedCount = 0;
function appendNewCards(newVideos) {
  if (emptyState.parentNode) emptyState.style.display = 'none';
  listHeader.style.display = 'flex';
  badge.textContent = newVideos.length;

  for (let i = renderedCount; i < newVideos.length; i++) {
    videoList.appendChild(renderCard(newVideos[i], i));
  }
  renderedCount = newVideos.length;
}

function clearList() {
  [...videoList.children].forEach(c => {
    if (c.id !== 'emptyState') c.remove();
  });
  emptyState.style.display = '';
  listHeader.style.display = 'none';
  dlAllBar.style.display   = 'none';
  badge.textContent = '0';
  renderedCount = 0;
  videos = [];
}

// ── Download single video ──
function downloadSingle(btn) {
  const url  = btn.dataset.url;
  const desc = btn.dataset.desc;
  const filename = `douyin_${desc}.mp4`;

  btn.textContent = '⏳ Đang tải...';
  btn.classList.add('downloading');
  btn.disabled = true;

  chrome.downloads.download({ url, filename, saveAs: false }, (dlId) => {
    if (chrome.runtime.lastError) {
      btn.textContent = '❌ Thất bại';
      btn.classList.remove('downloading');
      btn.disabled = false;
      return;
    }
    const listener = (delta) => {
      if (delta.id !== dlId) return;
      if (delta.state?.current === 'complete') {
        btn.textContent = '✅ Xong';
        btn.classList.remove('downloading');
        btn.classList.add('done');
        chrome.downloads.onChanged.removeListener(listener);
      } else if (delta.state?.current === 'interrupted') {
        btn.textContent = '❌ Thất bại';
        btn.classList.remove('downloading');
        btn.disabled = false;
        chrome.downloads.onChanged.removeListener(listener);
      }
    };
    chrome.downloads.onChanged.addListener(listener);
  });
}

// ── Download all ──
btnDlAll.addEventListener('click', () => {
  const allBtns = videoList.querySelectorAll('.btn-dl:not(.done):not(.downloading)');
  let delay = 0;
  allBtns.forEach((btn) => {
    setTimeout(() => downloadSingle(btn), delay);
    delay += 600; // stagger to avoid browser blocking
  });
});

// ── Start extraction ──
btnStart.addEventListener('click', async () => {
  if (isRunning) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.includes('douyin.com/user/')) {
    warning.style.display = 'block';
    setStatus('⚠️', 'Sai trang', 'Mở trang cá nhân Douyin trước');
    return;
  }

  warning.style.display = 'none';
  activeTabId = tab.id;
  isRunning   = true;
  clearList();

  btnStart.disabled = true;
  btnStart.textContent = '⏳ Đang chạy...';
  btnClear.disabled = true;
  dlAllBar.style.display = 'none';

  setStatus('⏳', 'Đang khởi động...', 'Đang chuẩn bị...');

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['extractor.js'],
    });
    await chrome.tabs.sendMessage(tab.id, { type: 'START_EXTRACT' });
    setStatus('⏳', 'Đang tải...', 'Đang lấy danh sách video từ Douyin');
  } catch (e) {
    isRunning = false;
    btnStart.disabled = false;
    btnStart.textContent = '▶ Bắt đầu';
    setStatus('❌', 'Lỗi', e.message);
  }
});

// ── Clear ──
btnClear.addEventListener('click', () => {
  clearList();
  setStatus('🎬', 'Sẵn sàng', 'Mở trang cá nhân Douyin rồi nhấn Bắt đầu');
  btnClear.disabled = true;
  progressWrap.style.display = 'none';
  bar.style.width = '0%';
});

// ── Messages from extractor (via background) ──
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'PROGRESS') {
    videos = msg.videos || [];
    updateProgress(msg.count);
    appendNewCards(videos);
    setStatus('⏳', 'Đang tải...', `Đã tìm thấy ${msg.count} video`);
  }

  if (msg.type === 'DONE') {
    videos = msg.videos || [];
    isRunning = false;
    bar.style.width = '100%';
    progressLabel.textContent = 'Hoàn tất';
    progressCount.textContent = `${videos.length} video`;
    appendNewCards(videos);

    btnStart.disabled = false;
    btnStart.textContent = '🔄 Chạy lại';
    btnClear.disabled = false;

    if (videos.length > 0) {
      dlAllBar.style.display = 'block';
      setStatus('✅', `Xong! ${videos.length} video`, 'Nhấn ⬇ để tải xuống');
    } else {
      setStatus('😕', 'Không tìm thấy video', 'Thử tải lại trang rồi chạy lại');
    }
  }

  if (msg.type === 'ERROR') {
    setStatus('⚠️', 'Lỗi', msg.message);
  }
});

// ── Init: check current tab ──
(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.includes('douyin.com/user/')) {
    warning.style.display = 'block';
    setStatus('⚠️', 'Sai trang', 'Mở trang cá nhân Douyin trước');
    btnStart.disabled = true;
  }
})();

// ── Donate section ──
const BANK_ID      = 'MB';
const ACCOUNT_NO   = '0344154318';
const ACCOUNT_NAME = 'TRAN VAN THANH';
const TEMPLATE     = 'compact2';

const btnDonateToggle = document.getElementById('btnDonateToggle');
const donatePanel     = document.getElementById('donatePanel');
const qrImg           = document.getElementById('qrImg');
const qrAmountLabel   = document.getElementById('qrAmountLabel');
const customAmountInput = document.getElementById('customAmount');
const btnCustomApply  = document.getElementById('btnCustomApply');

let currentAmount = 5000;

function formatVND(amount) {
  return Number(amount).toLocaleString('vi-VN') + 'đ';
}

function buildQrUrl(amount) {
  const desc = encodeURIComponent('Ung ho tac gia');
  const name = encodeURIComponent(ACCOUNT_NAME);
  return `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${amount}&addInfo=${desc}&accountName=${name}`;
}

function setAmount(amount) {
  currentAmount = amount;
  qrAmountLabel.textContent = formatVND(amount);
  qrImg.src = buildQrUrl(amount);

  // Update active state on preset buttons
  document.querySelectorAll('.btn-amount').forEach(b => {
    b.classList.toggle('active', Number(b.dataset.amount) === amount);
  });
}

// Toggle panel open/close
btnDonateToggle.addEventListener('click', () => {
  const isOpen = donatePanel.classList.toggle('open');
  btnDonateToggle.textContent = isOpen ? '✕ Đóng' : '☕ Ủng hộ tác giả';
  if (isOpen && !qrImg.src.includes('vietqr')) {
    setAmount(currentAmount); // load QR on first open
  }
});

// Preset amount buttons
document.querySelectorAll('.btn-amount').forEach(btn => {
  btn.addEventListener('click', () => {
    customAmountInput.value = '';
    setAmount(Number(btn.dataset.amount));
  });
});

// Custom amount
btnCustomApply.addEventListener('click', () => {
  const val = parseInt(customAmountInput.value, 10);
  if (!val || val < 1000) {
    customAmountInput.focus();
    return;
  }
  setAmount(val);
});

customAmountInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnCustomApply.click();
});

// Init default QR (lazy — only when panel opens)
setAmount(5000);
