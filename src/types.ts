export interface CliOptions {
  /** 前後に渡す文脈行数 */
  context: number;
  /** JEVへの同時リクエスト数 */
  concurrency: number;
  /** JSON形式で出力するか */
  json: boolean;
  /** 明らかな誤り以外も含めて出力するか */
  all: boolean;
  /** 入力ファイルパス。未指定ならstdin */
  file?: string;
}

export interface LineEntry {
  /** 1始まりの行番号 */
  line: number;
  /** 行のテキスト */
  text: string;
}

export interface JudgeResult {
  line: number;
  text: string;
  /** 誤りである確率(0-1)。判定対象外の行にはundefined */
  score?: number;
  /** 明らかな誤りと判定されたか */
  isError: boolean;
  /** JEVへのリクエストが失敗した場合のエラーメッセージ */
  requestError?: string;
}
