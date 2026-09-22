# テキスト正誤判定ツール

TypeScript製CLIツール。
テキストを行単位で解析し、明らかな誤りをTypeSafe / JEVで検出する。

## 処理

1. 入力テキストを行単位に分割
2. 判定不要な行を除外
3. 各行について前後の文脈を取得
4. 対象行＋文脈をJEVに渡して正誤判定
5. 判定結果を出力

対象行だけではなく、前後の文脈を考慮する。

## インストール

```sh
npm install -g jev-text-assert
```

Node.js 20以上が必要。

## 使い方

環境変数 `TYPESAFE_API_KEY` を設定して実行する。

```sh
# ファイルを指定
jev-text-assert input.txt

# 標準入力
cat input.txt | jev-text-assert
```

## JEV

`Noul` を使用する。

判定内容：

> 対象行の記述に明らかな事実誤認があるか？

単なる意見・表現・曖昧さは誤りとしない。

## 出力

デフォルトでは**明らかな誤りのみ**出力する。

```text
10: 東京タワーは大阪にある。
```

明らかな誤りがない場合は出力しない。

判定結果の確信度が低いものや、判断が難しいものもデフォルトでは出力しない
（Noul値が0.8未満の行は誤りとして扱わない）。

## オプション

```text
--context <number>       前後に渡す行数（デフォルト: 2）
--concurrency <number>   JEVへの同時リクエスト数（デフォルト: 4）
--json                   JSON形式で出力
--all                    明らかな誤り以外も含めて出力
```

`--all` 指定時は、各行のNoul値も出力する。

```json
{
  "line": 10,
  "text": "東京タワーは大阪にある。",
  "score": 0.01
}
```

## 判定対象外

以下は原則としてJEVに送信しない。

* 空行
* 明らかな見出し
* URL
* コードブロック
* 単なる装飾・記号

## エラー

JEVのリクエストに失敗した場合は誤りとは判定せず、エラーとして扱う。

```text
10: [ERROR] 東京タワーは大阪にある。 (401 Cannot authenticate with the server. ...)
```

`--json` 指定時は `error` フィールドに格納する。

```json
{
  "line": 10,
  "text": "東京タワーは大阪にある。",
  "error": "401 Cannot authenticate with the server. ..."
}
```

