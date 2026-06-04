#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = execFileSync("git", ["-C", scriptDir, "rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const workspacePath = join(repoRoot, "blog-worktrees.code-workspace");

const rawWorktrees = execFileSync("git", ["-C", repoRoot, "worktree", "list", "--porcelain"], {
  encoding: "utf8",
});

const records = rawWorktrees
  .trim()
  .split(/\n\n+/)
  .map((record) => {
    const fields = new Map();

    for (const line of record.split("\n")) {
      const [key, ...valueParts] = line.split(" ");
      fields.set(key, valueParts.join(" "));
    }

    return {
      path: fields.get("worktree"),
      branch: fields.get("branch")?.replace(/^refs\/heads\//, "") ?? "detached",
    };
  })
  .filter((record) => record.path);

const basenameCounts = new Map();

for (const record of records) {
  const basename = record.path.split("/").filter(Boolean).at(-1) ?? record.path;
  basenameCounts.set(basename, (basenameCounts.get(basename) ?? 0) + 1);
}

const folders = records.map((record) => {
  const basename = record.path.split("/").filter(Boolean).at(-1) ?? record.path;
  const name = basenameCounts.get(basename) === 1 ? basename : `${basename} (${record.branch})`;

  return {
    name,
    path: record.path,
  };
});

const watcherExcludes = {
  "**/.next/**": true,
  "**/node_modules/**": true,
  "**/storybook-static/**": true,
  "**/playwright-report/**": true,
  "**/test-results/**": true,
  "**/dist/**": true,
  "**/build/**": true,
  "**/out/**": true,
};

const workspace = {
  folders,
  settings: {
    "files.watcherExclude": watcherExcludes,
    "search.exclude": watcherExcludes,
  },
};

writeFileSync(workspacePath, `${JSON.stringify(workspace, null, 2)}\n`);

const displayPath = relative(process.cwd(), workspacePath) || workspacePath;
console.log(`Updated ${displayPath}`);
console.log(`Folders: ${folders.length}`);
