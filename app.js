const samples = [];
const CARD_LIFETIME_MS = 3 * 24 * 60 * 60 * 1000;

const SUPABASE_URL = 'https://qtwdqoeogcslimshfemq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_IHnTSnKC5n7gQ6kVp2MWIA_IocB-6VJ';
const API_HEADERS = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  'Content-Type': 'application/json'
};

const form = document.querySelector('#entry-form');
const input = document.querySelector('#entry');
const count = document.querySelector('#count');
const grid = document.querySelector('#entry-grid');
const notice = document.querySelector('#notice');
const composeView = document.querySelector('#compose-view');
const openButtons = document.querySelectorAll('[data-open-compose]');
const closeButtons = document.querySelectorAll('[data-close-compose]');
const shareDialog = document.querySelector('#share-dialog');
let selectedEntry = null;
let publishedEntries = [];

function escapeHTML(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function allEntries() {
  return [...publishedEntries, ...samples];
}

function relativeTime(value) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 90) return 'vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return 'tuần trước';
}

async function loadPublishedEntries() {
  try {
    const createdAfter = new Date(Date.now() - CARD_LIFETIME_MS).toISOString();
    const params = new URLSearchParams({
      select: 'id,body,created_at',
      order: 'created_at.desc',
      limit: '48',
      created_at: `gte.${createdAfter}`
    });
    const response = await fetch(`${SUPABASE_URL}/rest/v1/notes?${params}`, { headers: API_HEADERS });
    if (!response.ok) throw new Error('Không thể tải nhật ký chung.');
    const notes = await response.json();
    publishedEntries = notes.map((note) => ({ id: note.id, text: note.body, time: relativeTime(note.created_at) }));
    render();
  } catch {
    showNotice('Chưa thể tải nhật ký chung. Hãy thử lại sau.');
  }
}

function columnCount() {
  if (window.innerWidth <= 540) return 1;
  if (window.innerWidth <= 820) return 2;
  return 3;
}

function card(entry, index) {
  return `<article class="entry-card">
    <div class="entry-object"><span>${escapeHTML(entry.text)}</span><div class="entry-meta"><span>ẩn danh · ${entry.time}</span></div><div class="card-actions"><button type="button" class="share-card" data-index="${index}" aria-label="Chia sẻ card này"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-9 9M5 8v11h11v-6"/></svg></button><button type="button" class="empathy" data-index="${index}" aria-label="Đồng cảm"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2S4 15.6 4 9.5C4 6.8 6 5 8.5 5c1.7 0 2.9.9 3.5 2 0 0 1.8-2 3.5-2C18 5 20 6.8 20 9.5c0 6.1-8 10.7-8 10.7Z"/></svg></button></div></div>
  </article>`;
}

function render() {
  const entries = allEntries().slice(0, 24);
  const columns = Array.from({ length: columnCount() }, () => ({ weight: 0, entries: [] }));
  entries.forEach((entry, index) => {
    const target = columns.reduce((shortest, column) => column.weight < shortest.weight ? column : shortest);
    target.entries.push({ entry, index });
    target.weight += Math.min(entry.text.length, 480) + 90;
  });
  grid.innerHTML = columns.map((column) => `<div class="entry-column">${column.entries.map(({ entry, index }) => card(entry, index)).join('')}</div>`).join('');
}

function openCompose() {
  composeView.hidden = false;
  composeView.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => input.focus());
}

function closeCompose() {
  composeView.hidden = true;
  composeView.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function shareLink() {
  const url = new URL(window.location.origin + window.location.pathname);
  url.hash = 'nhat-ky';
  return url.toString();
}

function openShareMenu(entry) {
  selectedEntry = entry;
  shareDialog.hidden = false;
  document.body.style.overflow = 'hidden';
  shareDialog.querySelector('[data-close-share]').focus();
}

function closeShareMenu() {
  shareDialog.hidden = true;
  if (composeView.hidden) document.body.style.overflow = '';
}

async function copyShareLink() {
  const url = shareLink();
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    const helper = document.createElement('textarea');
    helper.value = url;
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.append(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
  }
  closeShareMenu();
  showNotice('Đã sao chép liên kết của card.');
}

openButtons.forEach((button) => button.addEventListener('click', openCompose));
closeButtons.forEach((button) => button.addEventListener('click', closeCompose));
shareDialog.querySelector('[data-close-share]').addEventListener('click', closeShareMenu);
shareDialog.querySelectorAll('[data-share-platform]').forEach((button) => button.addEventListener('click', async () => {
  const platform = button.dataset.sharePlatform;
  const url = shareLink();
  if (platform === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    closeShareMenu();
  } else if (platform === 'zalo') {
    window.open(`https://zalo.me/share?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    closeShareMenu();
  } else if (platform === 'instagram' && navigator.share) {
    try { await navigator.share({ title: 'Nhật ký công sở', text: 'Đọc những mẩu ghi ẩn danh tại Nhật ký công sở.', url }); } catch { return; }
    closeShareMenu();
  } else {
    await copyShareLink();
  }
}));
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!shareDialog.hidden) closeShareMenu();
  else if (!composeView.hidden) closeCompose();
});

input.addEventListener('input', () => { count.textContent = input.value.length; });
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) { showNotice('Hãy nhập một mẩu ghi để đăng.'); return; }
  if (/(@|https?:\/\/)/.test(text)) {
    showNotice('Không thể đăng liên kết hoặc địa chỉ liên hệ.'); return;
  }
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Đang đăng…';
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/notes`, {
      method: 'POST',
      headers: { ...API_HEADERS, Prefer: 'return=representation' },
      body: JSON.stringify({ body: text })
    });
    if (!response.ok) throw new Error('Không thể đăng mẩu ghi.');
    const [note] = await response.json();
    publishedEntries.unshift({ id: note.id, text: note.body, time: relativeTime(note.created_at) });
    form.reset();
    count.textContent = '0';
    render();
    closeCompose();
    document.querySelector('#nhat-ky').scrollIntoView({ behavior: 'smooth' });
    showNotice('Mẩu ghi đã được đăng cho mọi người cùng xem.');
  } catch {
    showNotice('Không thể đăng lúc này. Hãy thử lại sau.');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Đăng ẩn danh';
  }
});

grid.addEventListener('click', (event) => {
  const shareButton = event.target.closest('.share-card');
  if (shareButton) { openShareMenu(allEntries()[Number(shareButton.dataset.index)]); return; }
  const button = event.target.closest('.empathy');
  if (!button) return;
  const active = button.dataset.active === 'true';
  button.dataset.active = String(!active);
  button.classList.toggle('is-active', !active);
  showNotice(active ? 'Đã bỏ đồng cảm.' : 'Đã gửi một dấu hiệu đồng cảm.');
});

let resizeTimer;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(render, 150); });
let timeout;
function showNotice(message) {
  notice.textContent = message;
  notice.classList.add('is-visible');
  clearTimeout(timeout);
  timeout = setTimeout(() => notice.classList.remove('is-visible'), 3600);
}

render();
loadPublishedEntries();
window.addEventListener('visibilitychange', () => { if (!document.hidden) loadPublishedEntries(); });
window.setInterval(() => { if (!document.hidden) loadPublishedEntries(); }, 15000);
