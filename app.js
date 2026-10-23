const samples = [
  { text: 'Có những cuộc họp làm mình thấy ý kiến bị đi qua quá nhanh. Mình ước có thêm khoảng lặng để mọi người nói hết câu.', time: 'hôm nay' },
  { text: 'Mình đã nhận quá nhiều việc vì ngại từ chối. Ngày mai sẽ thử hỏi lại ưu tiên trước khi nhận thêm.', time: 'hôm qua' },
  { text: 'Một lời cảm ơn nhỏ sau giờ căng thẳng làm cả buổi chiều dễ thở hơn nhiều.', time: '3 ngày trước' }
];
const form = document.querySelector('#entry-form');
const input = document.querySelector('#entry');
const count = document.querySelector('#count');
const grid = document.querySelector('#entry-grid');
const notice = document.querySelector('#notice');

function escapeHTML(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
function savedEntries() { try { return JSON.parse(localStorage.getItem('work-journal-entries') || '[]'); } catch { return []; } }
function render() {
  grid.innerHTML = [...savedEntries(), ...samples].slice(0, 9).map((entry, index) => `<article class="entry-card"><div class="entry-object">${escapeHTML(entry.text)}</div><div class="entry-meta"><span>ẩn danh · ${entry.time}</span><button type="button" class="empathy" data-index="${index}">đồng cảm <span>○</span></button></div></article>`).join('');
}
function showNotice(message) { notice.textContent = message; notice.classList.add('is-visible'); clearTimeout(showNotice.timeout); showNotice.timeout = setTimeout(() => notice.classList.remove('is-visible'), 3600); }
input.addEventListener('input', () => { count.textContent = input.value.length; });
form.addEventListener('submit', (event) => {
  event.preventDefault(); const text = input.value.trim();
  if (/(@|https?:\/\/|\b[A-ZÀ-Ỹ][a-zà-ỹ]{1,}\s+[A-ZÀ-Ỹ][a-zà-ỹ]{1,})/.test(text)) return showNotice('Hãy xoá tên, liên kết hoặc dấu hiệu có thể nhận diện người khác trước khi lưu.');
  const entries = savedEntries(); entries.unshift({ text, time: 'vừa xong' }); localStorage.setItem('work-journal-entries', JSON.stringify(entries)); form.reset(); count.textContent = '0'; render(); showNotice('Đã lưu trong trình duyệt của bạn.'); document.querySelector('#nhat-ky').scrollIntoView({ behavior: 'smooth' });
});
grid.addEventListener('click', (event) => { const button = event.target.closest('.empathy'); if (!button) return; const active = button.dataset.active === 'true'; button.dataset.active = String(!active); button.querySelector('span').textContent = active ? '○' : '●'; showNotice(active ? 'Đã bỏ đồng cảm.' : 'Đã gửi một dấu hiệu đồng cảm.'); });
render();
