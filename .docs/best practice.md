# ベストプラクティス (Best Practices)

本拡張機能（YouTube History AI Filter Extension）をモダンかつスムーズに開発するための、最新技術スタックにおけるベストプラクティスと推奨設定をまとめます。

## 1. 開発環境・ビルドツール (Vite + CRXJS)
Chrome拡張機能の開発において、ReactとViteの組み合わせは非常に強力ですが、Manifest V3のビルドやホットリロード（HMR）を簡単にするために、専用のプラグインを使用することを強く推奨します。

* **推奨プラグイン:** `@crxjs/vite-plugin`
* **メリット:** Viteの高速なHMRをそのまま拡張機能開発（PopupやContent Scriptなど）で利用できます。通常、コードの変更ごとに拡張機能をリロードする手間が省け、開発体験が飛躍的に向上します。

## 2. ディレクトリ構成
拡張機能のコンポーネント（Popup, Content Script, Background）ごとにディレクトリを分割し、責任を明確にします。

```text
src/
 ├── popup/         # Popup UI用のReactコンポーネント群
 │    ├── Popup.tsx
 │    ├── components/ # ChatBubble, InputForm, Loadingなど
 │    └── store/      # 状態管理（必要に応じて）
 ├── content/       # Content Script用のスクリプト
 │    └── index.ts  # スクレイピングロジック
 ├── background/    # Service Worker（Background）スクリプト
 │    └── index.ts
 ├── lib/           # 共通ユーティリティ（Gemini APIクライアントなど）
 └── manifest.json  # 拡張機能の設定ファイル (CRXJSでVite設定から生成可能)
```

## 3. React + Tailwind CSS のUI構築
* **コンポーネント指向:** Chatのメッセージ、入力フォーム、ローディング表示などは細かくコンポーネントに分割し、再利用性と可読性を高めます。
* **Tailwind CSSの実装:** `classnames` もしくは `clsx` と `tailwind-merge` などを組み合わせて、条件付きのクラス付与を綺麗に書くのがモダンなアプローチです。
* **状態管理:** 本プロジェクトの規模であれば、外部ライブラリ（Redux等）は不要です。React標準の `useState` と `useReducer`、必要なら `useContext` だけで十分にチャット状態を管理できます。

## 4. 拡張機能特有のAPIと通信 (Chrome API)
Popup（React）と Content Script（Vanilla JS/TS）間での通信処理は、プロミスベースのラップを行うか、簡潔なインターフェースで管理します。

* **メッセージパッシング:** `chrome.tabs.sendMessage` を使用して、Popupから現在アクティブなタブ（YouTube履歴ページ）のContent Scriptへ命令を送ります。
* **ページの検証:** スクレイピングを実行する前に `chrome.tabs.query({ active: true, currentWindow: true })` を使用し、現在開いているURLが `https://www.youtube.com/feed/history` に一致するかを検証し、一致しない場合は即座にPopup上でエラーを表示します。

## 5. Gemini APIの利用における注意点
* **システムプロンプトの活用:** Geminiには、AIのペルソナ（今回は「YouTube履歴の抽出アシスタント」）と、常に「実行の確認（フェーズ1）」や「JSON化されたデータのフィルタリング（フェーズ3）」という振る舞いを厳格に守らせるための、強力なシステムプロンプトを設定します。
* **APIキーの管理:** 要件通りViteの環境変数 (`VITE_GEMINI_API_KEY`) で管理し、`.env` ファイルは必ず `.gitignore` に追加してください（誤ってGitHub等に公開しないため）。
* **JSON出力の安定化:** フェーズ3において、Geminiから望まない文章（「以下が結果です」など）が出力されるのを防ぐため、指示に「指定のマークダウン形式のみを出力すること」と強く明記するか、`responseMimeType: "application/json"` を利用してJSONで受け取りフロント側でレンダリングするアプローチが確実です。

## 6. スクレイピング (Content Script) の安定性
* **Dom操作のエラーハンドリング:** YouTubeのDOM構造は変更される可能性があるため、`querySelector` が `null` を返した場合のエラーハンドリングを実装し、拡張機能全体がクラッシュしないようにします。
* **スクロール処理の待機:** スクロールイベントを連続で発行する際は、`setTimeout` や `requestAnimationFrame` などを利用して、非同期で描画（Lazy Load）が完了するのを待機（例: 1000ms〜2000msの遅延）してから次のスクロールを行うようにします。
