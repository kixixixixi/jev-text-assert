#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { TypeSafeClient } from "@typesafe-ai/sdk";
import { parseArgs } from "./cli.js";
import { splitLines } from "./lines.js";
import { judgeLines } from "./judge.js";
import { formatResults } from "./format.js";

async function readInput(file?: string): Promise<string> {
  if (file) return readFile(file, "utf-8");

  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const text = await readInput(options.file);
  const entries = splitLines(text);

  const client = new TypeSafeClient();
  const results = await judgeLines(entries, options.context, options.concurrency, client);

  const output = formatResults(results, options);
  if (output) console.log(output);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
