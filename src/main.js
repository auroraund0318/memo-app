const titleInput = document.getElementById('title');
const textarea = document.getElementById('memo');
const saveButton = document.getElementById('save');
const downloadButton = document.getElementById('download');
const memoList = document.getElementById('memoList');
const toggleDarkButton = document.getElementById('toggle-dark');

// Service Worker の登録
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// localStorageからすべてのメモを取得（キー: 'memos'）
function getAllMemos() {
  const memos = localStorage.getItem('memos');
  return memos ? JSON.parse(memos) : {};
}

// メモ一覧を画面に描画
function renderMemoList() {
  const memos = getAllMemos();
  memoList.innerHTML = ''; // 一旦クリア

  Object.keys(memos).forEach((title) => {
    const li = document.createElement('li');
    
    // タイトル部分（クリックでそのメモを編集画面に反映）
    const span = document.createElement('span');
    span.textContent = title;
    span.style.cursor = 'pointer';
    span.style.marginRight = '10px';
    span.addEventListener('click', () => {
      titleInput.value = title;
      textarea.value = memos[title];
    });

    // 削除ボタン
    const delBtn = document.createElement('button');
    delBtn.textContent = '❌';
    delBtn.style.marginLeft = '5px';
    delBtn.addEventListener('click', () => {
      if (confirm(`「${title}」を削除しますか？`)) {
        delete memos[title];
        localStorage.setItem('memos', JSON.stringify(memos));
        renderMemoList();
        // 編集中のメモが削除された場合はフォームをクリア
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

// 保存処理をまとめた関数
function saveMemo() {
  const title = titleInput.value.trim();
  const body = textarea.value;
  
  if (!title) return;
  
  const memos = getAllMemos();
  memos[title] = body;
  localStorage.setItem('memos', JSON.stringify(memos));
  renderMemoList();
}

// 手動保存ボタンの処理
saveButton.addEventListener('click', () => {
  saveMemo();
  alert('保存しました！');
});

// オートセーブ用タイマー（1秒間入力が止まったら保存）
let autoSaveTimer;
textarea.addEventListener('input', () => {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    if (titleInput.value.trim() === '') return;
    saveMemo();
    console.log('自動保存しました！');
  }, 1000);
});

// .md形式でダウンロードする機能
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

// ダークモード切替機能
toggleDarkButton.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

// ページ読み込み時にメモ一覧を描画
window.addEventListener('DOMContentLoaded', () => {
  renderMemoList();
});
