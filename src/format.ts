import type { CliOptions, JudgeResult } from "./types.js";

function shouldInclude(result: JudgeResult, options: CliOptions): boolean {
  if (result.requestError) return true;
  if (options.all) return result.score !== undefined;
  return result.isError;
}

export function formatResults(results: JudgeResult[], options: CliOptions): string {
  const filtered = results.filter((r) => shouldInclude(r, options));

  if (options.json) {
    return JSON.stringify(
      filtered.map(({ line, text, score, requestError }) => ({
        line,
        text,
        ...(score !== undefined ? { score } : {}),
        ...(requestError ? { error: requestError } : {}),
      })),
      null,
      2,
    );
  }

  return filtered
    .map((r) => {
      if (r.requestError) return `${r.line}: [ERROR] ${r.text} (${r.requestError})`;
      if (r.score !== undefined) return `${r.line}: ${r.text} (score: ${r.score})`;
      return `${r.line}: ${r.text}`;
    })
    .join("\n");
}
