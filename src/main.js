import { messages } from './i18n.js';

// 現在の言語を localStorage またはブラウザ設定から決定
let currentLang = localStorage.getItem('lang') || (navigator.language.startsWith('ja') ? 'ja' : 'en');
let t = messages[currentLang];

const titleInput = document.getElementById('title');
const textarea = document.getElementById('memo');
const saveButton = document.getElementById('save');
const downloadButton = document.getElementById('download');
const toggleDarkButton = document.getElementById('toggle-dark');
const memoList = document.getElementById('memoList');

// 言語切替ボタンのイベントリスナー
document.getElementById('lang-en').addEventListener('click', () => {
  setLanguage('en');
});
document.getElementById('lang-ja').addEventListener('click', () => {
  setLanguage('ja');
});

function setLanguage(lang) {
  currentLang = lang;
  t = messages[currentLang];
  localStorage.setItem('lang', lang);
  applyTranslations();
}

function applyTranslations() {
  document.getElementById('title-text').textContent = t.appTitle;
  saveButton.textContent = t.save;
  downloadButton.textContent = t.download;
  toggleDarkButton.textContent = t.darkMode;
  titleInput.placeholder = t.titlePlaceholder;
  textarea.placeholder = t.bodyPlaceholder;
  document.getElementById('list-label').textContent = t.savedList;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered with scope:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

function getAllMemos() {
  const memos = localStorage.getItem('memos');
  return memos ? JSON.parse(memos) : {};
}

function renderMemoList() {
  const memos = getAllMemos();
  memoList.innerHTML = '';
  Object.keys(memos).forEach((title) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = title;
    span.style.cursor = 'pointer';
    span.style.marginRight = '10px';
    span.addEventListener('click', () => {
      titleInput.value = title;
      textarea.value = memos[title];
    });
    const delBtn = document.createElement('button');
    delBtn.textContent = '❌';
    delBtn.style.marginLeft = '5px';
    delBtn.addEventListener('click', () => {
      if (confirm(t.deleteConfirm(title))) {
        const memos = getAllMemos();
        delete memos[title];
        localStorage.setItem('memos', JSON.stringify(memos));
        renderMemoList();
        if (titleInput.value === title) {
          titleInput.value = '';
          textarea.value = '';
        }
      }
    });
    li.appendChild(span);
    li.appendChild(delBtn);
    memoList.appendChild(li);
  });
}

function saveMemo() {
  const title = titleInput.value.trim();
  const body = textarea.value;
  if (!title) return;
  const memos = getAllMemos();
  memos[title] = body;
  localStorage.setItem('memos', JSON.stringify(memos));
  renderMemoList();
}

saveButton.addEventListener('click', () => {
  saveMemo();
  alert(t.savedAlert);
});

let autoSaveTimer;
textarea.addEventListener('input', () => {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    if (titleInput.value.trim() === '') return;
    saveMemo();
    console.log('Auto-saved');
  }, 1000);
});

downloadButton.addEventListener('click', () => {
  const title = titleInput.value.trim() || 'untitled';
  const body = textarea.value;
  const blob = new Blob([body], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

toggleDarkButton.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('darkMode', isDark);
});

window.addEventListener('DOMContentLoaded', () => {
  // 過去に設定されたダークモード状態を適用
  const storedDarkMode = localStorage.getItem('darkMode');
  if (storedDarkMode === 'true') {
    document.body.classList.add('dark');
  }
  applyTranslations();
  renderMemoList();
});
