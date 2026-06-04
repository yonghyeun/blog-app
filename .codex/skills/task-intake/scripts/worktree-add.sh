#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  .codex/skills/task-intake/scripts/worktree-add.sh <path> <branch> [start-point]

Examples:
  .codex/skills/task-intake/scripts/worktree-add.sh ../app-issue-56 work/56-worktree-vscode-workspace origin/main
  BLOG_APP_SKIP_CODE_ADD=1 .codex/skills/task-intake/scripts/worktree-add.sh ../app-issue-56 work/56-worktree-vscode-workspace

Behavior:
  - Creates a git worktree at <path>.
  - Creates <branch> from [start-point] when the branch does not exist.
  - Rebuilds blog-worktrees.code-workspace from git worktree list.
  - Runs "code --add <path>" when VS Code CLI exists, unless BLOG_APP_SKIP_CODE_ADD=1.
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ "$#" -lt 2 || "$#" -gt 3 ]]; then
  usage >&2
  exit 2
fi

target_path="$1"
branch="$2"
start_point="${3:-HEAD}"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(git rev-parse --show-toplevel)"
target_parent="$(dirname "$target_path")"
target_name="$(basename "$target_path")"

if [[ ! -d "$target_parent" ]]; then
  echo "Target parent directory does not exist: $target_parent" >&2
  exit 1
fi

target_abs="$(cd "$target_parent" && pwd -P)/$target_name"

if git -C "$repo_root" show-ref --verify --quiet "refs/heads/$branch"; then
  git -C "$repo_root" worktree add "$target_abs" "$branch"
else
  git -C "$repo_root" worktree add -b "$branch" "$target_abs" "$start_point"
fi

node "$script_dir/update-vscode-workspace.mjs"

if [[ "${BLOG_APP_SKIP_CODE_ADD:-0}" != "1" ]]; then
  if command -v code >/dev/null 2>&1; then
    code --add "$target_abs" || {
      echo "VS Code CLI failed to add the worktree. Workspace file was still updated." >&2
    }
  else
    echo "VS Code CLI 'code' not found. Workspace file was still updated." >&2
  fi
fi

echo "Worktree ready: $target_abs"
