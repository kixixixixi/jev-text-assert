import type { CliOptions } from "./types.js";

const DEFAULT_CONTEXT = 2;
const DEFAULT_CONCURRENCY = 4;

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    context: DEFAULT_CONTEXT,
    concurrency: DEFAULT_CONCURRENCY,
    json: false,
    all: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--context": {
        const value = argv[++i];
        if (!value || Number.isNaN(Number(value))) {
          throw new Error("--context には数値を指定してください");
        }
        options.context = Number(value);
        break;
      }
      case "--concurrency": {
        const value = argv[++i];
        if (!value || Number.isNaN(Number(value))) {
          throw new Error("--concurrency には数値を指定してください");
        }
        options.concurrency = Number(value);
        break;
      }
      case "--json":
        options.json = true;
        break;
      case "--all":
        options.all = true;
        break;
      default:
        if (arg?.startsWith("--")) {
          throw new Error(`不明なオプション: ${arg}`);
        }
        options.file = arg;
    }
  }

  return options;
}
