# akashic-entry-sample
このディレクトリは、`@akc29/akashictool4multi`のゲーム参加希望者の管理と参加者の抽選機能を利用したサンプルコンテンツです。

### ビルド方法

このサンプルコンテンツ はTypeScriptで書かれているため、以下のコマンドでJavaScriptファイルに変換する必要があります。

```sh
npm install
npm run build
```

### 実行方法

以下のコマンドで akashic-cli-serve が起動されます。実行後、 `http://localhost:3300/` にアクセスしてください。

```
npm start
```

### 操作方法
* 配信者側は「ゲーム開始」ボタンを押すと、参加者の抽選が行われ当選した参加者の名前が表示された画面に遷移します。
* 視聴者側は「ゲームに参加」ボタンを押すことで参加希望を出した状態になり、「参加キャンセル」ボタンを押すことで参加希望を取り下げることができます。
