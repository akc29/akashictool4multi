# akashictool4multi

**akashictool4multi**はAkashicのマルチゲームを作成するための便利機能が入っているライブラリです。
現在このライブラリできることは、ゲーム参加希望者の管理と参加者の抽選のみです。

## 利用方法

[akashic-cli](https://github.com/akashic-games/akashic-cli)をインストールした後、

```sh
akashic install @akc29/akashictool4multi
```

でインストールできます。コンテンツからは、

```javascript
var tool = require("@akc29/akashictool4multi");
```

で利用してください。

### 参加者の募集と抽選をする例

```javascript
var tool = require("@akc29/akashictool4multi");
var entry = new tool.AkashicEntry({
    scene: scene,
    playableLimit: 4, // 最大参加人数を4名に設定
    startableCount: 2, // ゲーム開始可能人数を2名に設定
    callbackAfterDicision: function (members: tool.PlayerInfo[]) {
        // 参加者抽選完了後に実行される処理
        // 大体ここでシーン遷移することになると思う
        // ここでは参加者の数だけg.Spriteが作られてシーン遷移する処理が行われている
        var nextScene = new g.Scene({ game: g.game });
        members.forEach(m => {
            var playerSprite = new g.Sprite({...});
            // 中略
            nextScene.append(m);
        })
        g.game.pushScene(nextScene);
    }
});

// 中略
// 参加ボタン的なものを用意する
var joinButton = new g.Sprite({
    scene: scene,
    touchable: true,
    local: true, // 参加するかどうかはプレイヤー毎に違うので参加ボタンはローカルエンティティにすべき
    ...
});
joinButton.onPointUp.add(function(e) {
    // enterメソッドで参加ボタンを押したプレイヤーを参加希望状態にできる
    // 第2引数でtrueを渡すとニコ生ではユーザー名を使うかどうかのダイアログが表示される
    entry.enter({
        id: e.player.id,
        name: "player" + e.player.id
    }, true);
});
scene.append(joinButton);

// 中略
// 配信者しか押せない抽選ボタン的なものを用意する
var lotteryButton = new g.Sprite({
    scene: scene,
    touchable: true,
    local: true,
    ...
});
lotteryButton.onPointUp.add(function() {
    // decidePlayableMembersメソッドで参加希望者の中から実際に参加できる人を抽選する
    entry.decidePlayableMembers();
});
scene.append(lotteryButton);
```

### ビルド方法

`akashictool4multi` はTypeScriptで書かれているため、以下のコマンドでJavaScriptファイルに変換する必要があります。

```sh
npm install
npm run build
```

`src` ディレクトリ以下のTypeScriptファイルがコンパイルされ、`script` ディレクトリ以下にJavaScriptファイルが生成されます。

`npm run build` は自動的に `akashic scan asset script` を実行するので、`game.json` の更新が行われます。


## テスト方法

```sh
npm test
```

## APIドキュメント生成方法

```sh
npm run doc
```
