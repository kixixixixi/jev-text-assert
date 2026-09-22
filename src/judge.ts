import { TypeSafeClient, noul } from "@typesafe-ai/sdk";
import type { LineEntry, JudgeResult } from "./types.js";
import { isExcluded, buildContext } from "./lines.js";

const QUESTION_INSTRUCTIONS =
  "対象行(target)の記述に明らかな事実誤認があるか判定してください。" +
  "文脈(context_before, context_after)を考慮して判定してください。" +
  "単なる意見・表現・曖昧さは誤りとしません。";

function buildQuestion() {
  return noul(QUESTION_INSTRUCTIONS, {
    true: "対象行に明らかな事実誤認がある",
    false: "対象行に明らかな事実誤認はない。または単なる意見・表現・曖昧さである",
  });
}

/** 同時実行数を制限しつつ、各要素に対して非同期処理を行う */
async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const current = nextIndex++;
      if (current >= items.length) return;
      results[current] = await fn(items[current] as T);
    }
  }

  const workerCount = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(Array.from({ length: workerCount }, worker));

  return results;
}

/**
 * 各行をJEVで判定する。判定対象外の行はスキップし、リクエスト失敗行は
 * requestErrorを付与する。
 */
export async function judgeLines(
  entries: LineEntry[],
  contextSize: number,
  concurrency: number,
  threshold: number,
  client: TypeSafeClient,
): Promise<JudgeResult[]> {
  const excluded = isExcluded(entries);
  const targets = entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ index }) => !excluded[index]);

  const judged = await mapWithConcurrency(targets, concurrency, async ({ entry, index }) => {
    const { before, after } = buildContext(entries, index, contextSize);

    try {
      const { answers } = await client.systemOne({
        state: {
          context_before: before,
          target: entry.text,
          context_after: after,
        },
        questions: { misinformation: buildQuestion() },
      });

      const score = answers.misinformation.noul;
      return {
        line: entry.line,
        text: entry.text,
        score,
        isError: score >= threshold,
      } satisfies JudgeResult;
    } catch (err) {
      return {
        line: entry.line,
        text: entry.text,
        isError: false,
        requestError: err instanceof Error ? err.message : String(err),
      } satisfies JudgeResult;
    }
  });

  const byLine = new Map(judged.map((r) => [r.line, r]));

  return entries.map((entry) => byLine.get(entry.line) ?? {
    line: entry.line,
    text: entry.text,
    isError: false,
  });
}
