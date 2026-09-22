import type { LineEntry } from "./types.js";

/** テキストを行単位に分割し、1始まりの行番号を付与する */
export function splitLines(text: string): LineEntry[] {
  return text.split(/\r\n|\r|\n/).map((line, index) => ({
    line: index + 1,
    text: line,
  }));
}

const URL_ONLY_PATTERN = /^\s*https?:\/\/\S+\s*$/;
const HEADING_PATTERN = /^\s{0,3}#{1,6}\s/;
const CODE_FENCE_PATTERN = /^\s{0,3}(```|~~~)/;
const DECORATION_ONLY_PATTERN = /^[\s\-=*_~#・☆★◆■□●○※]+$/;

/**
 * 判定不要な行を除外する。
 * 空行 / 見出し / URL / コードブロック / 単なる装飾・記号を対象外とする。
 */
export function isExcluded(entries: LineEntry[]): boolean[] {
  const excluded = new Array<boolean>(entries.length).fill(false);
  let inCodeBlock = false;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    const trimmed = entry.text.trim();

    if (CODE_FENCE_PATTERN.test(entry.text)) {
      excluded[i] = true;
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) {
      excluded[i] = true;
      continue;
    }
    if (
      trimmed === "" ||
      HEADING_PATTERN.test(entry.text) ||
      URL_ONLY_PATTERN.test(entry.text) ||
      DECORATION_ONLY_PATTERN.test(trimmed)
    ) {
      excluded[i] = true;
    }
  }

  return excluded;
}

export interface LineContext {
  before: string[];
  after: string[];
}

/** 対象行の前後 `contextSize` 行分の文脈を取得する */
export function buildContext(
  entries: LineEntry[],
  targetIndex: number,
  contextSize: number,
): LineContext {
  const before = entries
    .slice(Math.max(0, targetIndex - contextSize), targetIndex)
    .map((e) => e.text);
  const after = entries
    .slice(targetIndex + 1, targetIndex + 1 + contextSize)
    .map((e) => e.text);
  return { before, after };
}
