import fs from "node:fs";
import path from "node:path";
import { getConfig } from "../config.js";
import type { PrIndex, PrDetail } from "../types/pr.js";

function dataDir(): string {
  return getConfig().DATA_DIR;
}

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

// --- PR Index (JSONL) ---

export function getPrIndexPath(): string {
  return path.join(dataDir(), "pr_index.jsonl");
}

export function appendPrIndex(entry: PrIndex): void {
  const filePath = getPrIndexPath();
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, JSON.stringify(entry) + "\n");
}

export function readPrIndex(): PrIndex[] {
  const filePath = getPrIndexPath();
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, "utf-8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as PrIndex);
}

export function writePrIndex(entries: PrIndex[]): void {
  const filePath = getPrIndexPath();
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, entries.map((e) => JSON.stringify(e)).join("\n") + "\n");
}

// --- PR Detail (JSON) ---

export function getPrDetailPath(owner: string, repo: string, prNumber: number): string {
  return path.join(dataDir(), owner, repo, "pr_detail", `${prNumber}.json`);
}

export function writePrDetail(owner: string, repo: string, detail: PrDetail): void {
  const filePath = getPrDetailPath(owner, repo, detail.number);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(detail, null, 2));
}

export function readPrDetail(owner: string, repo: string, prNumber: number): PrDetail | null {
  const filePath = getPrDetailPath(owner, repo, prNumber);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as PrDetail;
}

export function prDetailExists(owner: string, repo: string, prNumber: number): boolean {
  return fs.existsSync(getPrDetailPath(owner, repo, prNumber));
}

// --- PR Diff ---

export function getPrDiffPath(owner: string, repo: string, prNumber: number): string {
  return path.join(dataDir(), owner, repo, "pr_diff", `${prNumber}.diff`);
}

export function writePrDiff(owner: string, repo: string, prNumber: number, diff: string): void {
  const filePath = getPrDiffPath(owner, repo, prNumber);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, diff);
}

export function readPrDiff(owner: string, repo: string, prNumber: number): string | null {
  const filePath = getPrDiffPath(owner, repo, prNumber);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

export function prDiffExists(owner: string, repo: string, prNumber: number): boolean {
  return fs.existsSync(getPrDiffPath(owner, repo, prNumber));
}

// --- Fact Cards (JSON) ---

export function getFactCardPath(owner: string, repo: string, prNumber: number): string {
  return path.join(dataDir(), owner, repo, "fact_cards", `${prNumber}.json`);
}

export function writeFactCard(owner: string, repo: string, prNumber: number, card: unknown): void {
  const filePath = getFactCardPath(owner, repo, prNumber);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(card, null, 2));
}

export function readFactCard(owner: string, repo: string, prNumber: number): unknown | null {
  const filePath = getFactCardPath(owner, repo, prNumber);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function factCardExists(owner: string, repo: string, prNumber: number): boolean {
  return fs.existsSync(getFactCardPath(owner, repo, prNumber));
}

export function readAllFactCards(): { prNumber: number; card: unknown }[] {
  const index = readPrIndex();
  if (index.length === 0) return [];

  const seen = new Set<string>();
  const results: { prNumber: number; card: unknown }[] = [];

  for (const entry of index) {
    const key = `${entry.owner}/${entry.repo}/${entry.number}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const filePath = getFactCardPath(entry.owner, entry.repo, entry.number);
    if (!fs.existsSync(filePath)) continue;
    results.push({
      prNumber: entry.number,
      card: JSON.parse(fs.readFileSync(filePath, "utf-8")),
    });
  }

  return results;
}

// --- Narratives (JSON) ---

export function getNarrativePath(type: "star" | "care"): string {
  return path.join(dataDir(), "narratives", `${type}.json`);
}

export function writeNarrative(type: "star" | "care", data: unknown): void {
  const filePath = getNarrativePath(type);
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function readNarrative(type: "star" | "care"): unknown | null {
  const filePath = getNarrativePath(type);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
