import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "update-vscode-workspace.mjs");

function makeExecutable(filePath, content) {
  fs.writeFileSync(filePath, content, { mode: 0o755 });
}

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "task-close-workspace-"));
const fakeBin = path.join(tmpDir, "bin");
const repoRoot = path.join(tmpDir, "repo");
fs.mkdirSync(fakeBin, { recursive: true });
fs.mkdirSync(repoRoot, { recursive: true });

makeExecutable(
  path.join(fakeBin, "git"),
  `#!/usr/bin/env bash
set -euo pipefail

if [[ "$1" == "-C" && "$3" == "rev-parse" && "$4" == "--show-toplevel" ]]; then
  printf '%s\\n' "\${TASK_CLOSE_WORKSPACE_TEST_REPO:?}"
  exit 0
fi

if [[ "$1" == "-C" && "$3" == "worktree" && "$4" == "list" && "$5" == "--porcelain" ]]; then
  cat <<TREE
worktree ${repoRoot}
HEAD abc123
branch refs/heads/main

worktree ${path.join(tmpDir, "one", "app")}
HEAD def456
branch refs/heads/work/one

worktree ${path.join(tmpDir, "two", "app")}
HEAD fed654
detached
TREE
  exit 0
fi

printf 'unexpected git call: %s\\n' "$*" >&2
exit 1
`,
);

execFileSync(process.execPath, [scriptPath], {
  cwd: tmpDir,
  env: {
    ...process.env,
    PATH: `${fakeBin}${path.delimiter}${process.env.PATH}`,
    TASK_CLOSE_WORKSPACE_TEST_REPO: repoRoot,
  },
  encoding: "utf8",
});

const workspace = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "blog-worktrees.code-workspace"), "utf8"),
);

assert.deepEqual(workspace.folders, [
  { name: "repo", path: repoRoot },
  { name: "app (work/one)", path: path.join(tmpDir, "one", "app") },
  { name: "app (detached)", path: path.join(tmpDir, "two", "app") },
]);
assert.equal(workspace.settings["files.watcherExclude"]["**/node_modules/**"], true);
assert.equal(workspace.settings["search.exclude"]["**/.next/**"], true);

console.log("task-close update-vscode-workspace checks passed");
