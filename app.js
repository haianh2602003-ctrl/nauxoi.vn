const samples = [
  { text: 'Có những cuộc họp làm mình thấy ý kiến bị đi qua quá nhanh. Mình ước có thêm khoảng lặng để mọi người nói hết câu.', time: 'hôm nay' },
  { text: 'Mình đã nhận quá nhiều việc vì ngại từ chối. Ngày mai sẽ thử hỏi lại ưu tiên trước khi nhận thêm.', time: 'hôm qua' },
  { text: 'Một lời cảm ơn nhỏ sau giờ căng thẳng làm cả buổi chiều dễ thở hơn nhiều.', time: '3 ngày trước' },
  { text: 'Mình muốn thử nói rõ giới hạn của mình trong tuần này.', time: '4 ngày trước' },
  { text: 'Mong những buổi họp có thêm khoảng dừng để mọi người kịp suy nghĩ.', time: 'tuần trước' },
  { text: 'Hôm nay mình đã nghỉ năm phút trước khi trả lời một email khó.', time: 'tuần trước' }
];

const form = document.querySelector('#entry-form');
const input = document.querySelector('#entry');
const count = document.querySelector('#count');
const grid = document.querySelector('#entry-grid');
const notice = document.querySelector('#notice');
const composeView = document.querySelector('#compose-view');
const openButtons = document.querySelectorAll('[data-open-compose]');
const closeButtons = document.querySelectorAll('[data-close-compose]');

function escapeHTML(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function allEntries() {
  try { return [...JSON.parse(localStorage.getItem('work-journal-entries') || '[]'), ...samples]; }
  catch { return samples; }
}

function columnCount() {
  if (window.innerWidth <= 540) return 1;
  if (window.innerWidth <= 820) return 2;
  return 3;
}

function card(entry, index) {
  return `<article class="entry-card">
    <div class="entry-object"><span>${escapeHTML(entry.text)}</span><button type="button" class="empathy" data-index="${index}" aria-label="Đồng cảm"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2S4 15.6 4 9.5C4 6.8 6 5 8.5 5c1.7 0 2.9.9 3.5 2 0 0 1.8-2 3.5-2C18 5 20 6.8 20 9.5c0 6.1-8 10.7-8 10.7Z"/></svg></button></div>
    <div class="entry-meta"><span>ẩn danh · ${entry.time}</span></div>
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

openButtons.forEach((button) => button.addEventListener('click', openCompose));
closeButtons.forEach((button) => button.addEventListener('click', closeCompose));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !composeView.hidden) closeCompose(); });

input.addEventListener('input', () => { count.textContent = input.value.length; });
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) { showNotice('Hãy nhập một mẩu ghi để đăng.'); return; }
  if (/(@|https?:\/\/|\b[A-ZÀ-Ỹ][a-zà-ỹ]{1,}\s+[A-ZÀ-Ỹ][a-zà-ỹ]{1,})/.test(text)) {
    showNotice('Hãy xoá tên, liên kết hoặc dấu hiệu có thể nhận diện người khác trước khi đăng.'); return;
  }
  let entries = [];
  try { entries = JSON.parse(localStorage.getItem('work-journal-entries') || '[]'); } catch { entries = []; }
  entries.unshift({ text, time: 'vừa xong' });
  localStorage.setItem('work-journal-entries', JSON.stringify(entries));
  form.reset();
  count.textContent = '0';
  render();
  closeCompose();
  document.querySelector('#nhat-ky').scrollIntoView({ behavior: 'smooth' });
  showNotice('Mẩu ghi của bạn đã xuất hiện trên nhật ký.');
});

grid.addEventListener('click', (event) => {
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
