# SETUP_AND_UPDATE_GUIDE

このドキュメントは、Windows (cmd) で `pancakes` リポジトリを
**初回セットアップして起動する手順** と、
**更新を取り込んで反映確認する手順** をまとめたものです。

---

## 1. 初回セットアップ（最初の1回だけ）

### 1-1. Desktop に移動
```cmd
cd /d C:\Users\kajiu\Desktop
```

### 1-2. リポジトリをクローン
```cmd
git clone https://github.com/kajiuzu/pancakes.git
```

### 1-3. プロジェクトフォルダに移動
```cmd
cd /d C:\Users\kajiu\Desktop\pancakes
```

### 1-4. ファイル確認（任意）
```cmd
dir
```
`index.html` / `game.js` / `style.css` が見えればOKです。

---

## 2. 初回起動（ブラウザ確認）

### 2-1. ローカルサーバー起動
```cmd
python -m http.server 8000 --bind 127.0.0.1
```

### 2-2. ブラウザで開く
- <http://127.0.0.1:8000/index.html>

### 2-3. 操作
- `Space` で開始/リトライ
- `←→` または `A / D` で移動

### 2-4. サーバー停止
- `Ctrl + C`

---

## 3. 更新を取り込んで反映確認（2回目以降）

### 3-1. プロジェクトフォルダへ移動
```cmd
cd /d C:\Users\kajiu\Desktop\pancakes
```

### 3-2. 最新更新を取得
```cmd
git pull
```

### 3-3. 取得できたか確認（任意）
```cmd
git log --oneline -5
```

### 3-4. 反映確認のため再起動
```cmd
python -m http.server 8000 --bind 127.0.0.1
```
- ブラウザ: <http://127.0.0.1:8000/index.html>
- 表示が古い場合は `Ctrl + F5` で強制再読み込み

---

## 4. ローカル変更を GitHub に反映する手順

```cmd
cd /d C:\Users\kajiu\Desktop\pancakes
git add .
git commit -m "変更内容"
git push
```

---

## 5. よくあるエラー

### 5-1. `fatal: not a git repository`
`.git` がないフォルダで実行しています。以下へ移動して再実行してください。
```cmd
cd /d C:\Users\kajiu\Desktop\pancakes
```

### 5-2. `failed to push ... (fetch first)`
リモートに先行コミットがある状態です。
```cmd
git pull --rebase origin main
```
その後 `git push` を実行します。

### 5-3. `Author identity unknown`
最初に Git の名前/メール設定が必要です。
```cmd
git config --global user.email "you@example.com"
git config --global user.name "your-name"
```

### 5-4. `LF will be replaced by CRLF`
Windows でよく出る改行コード警告です。通常はそのまま続行して問題ありません。
