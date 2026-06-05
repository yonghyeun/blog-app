#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  .codex/skills/task-intake/scripts/worktree-add.sh <path> <branch> [start-point]
  .codex/skills/task-intake/scripts/worktree-add.sh --path <path> --branch <branch> [--base <start-point>] [--no-code-add]

Examples:
  .codex/skills/task-intake/scripts/worktree-add.sh ../app-issue-56 work/56-worktree-vscode-workspace origin/main
  BLOG_APP_SKIP_CODE_ADD=1 .codex/skills/task-intake/scripts/worktree-add.sh ../app-issue-56 work/56-worktree-vscode-workspace
  .codex/skills/task-intake/scripts/worktree-add.sh --path ../app-issue-56 --branch work/56-worktree-vscode-workspace --base origin/main --no-code-add

Behavior:
  - Creates a git worktree at <path>.
  - Creates <branch> from [start-point] when the branch does not exist.
  - Rebuilds blog-worktrees.code-workspace from git worktree list.
  - Runs "code --add <path>" when VS Code CLI exists, unless BLOG_APP_SKIP_CODE_ADD=1 or --no-code-add is set.
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

target_path=""
branch=""
start_point="HEAD"
skip_code_add="${BLOG_APP_SKIP_CODE_ADD:-0}"
positional=()

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --path)
      if [[ -z "${2:-}" ]]; then
        echo "Missing value for --path" >&2
        usage >&2
        exit 2
      fi
      target_path="$2"
      shift 2
      ;;
    --branch)
      if [[ -z "${2:-}" ]]; then
        echo "Missing value for --branch" >&2
        usage >&2
        exit 2
      fi
      branch="$2"
      shift 2
      ;;
    --base)
      if [[ -z "${2:-}" ]]; then
        echo "Missing value for --base" >&2
        usage >&2
        exit 2
      fi
      start_point="$2"
      shift 2
      ;;
    --no-code-add)
      skip_code_add="1"
      shift
      ;;
    --)
      shift
      while [[ "$#" -gt 0 ]]; do
        positional+=("$1")
        shift
      done
      ;;
    --*)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      positional+=("$1")
      shift
      ;;
  esac
done

if [[ "${#positional[@]}" -gt 0 ]]; then
  if [[ -n "$target_path" || -n "$branch" || "$start_point" != "HEAD" ]]; then
    echo "Do not mix positional arguments with --path, --branch, or --base" >&2
    usage >&2
    exit 2
  fi
  if [[ "${#positional[@]}" -lt 2 || "${#positional[@]}" -gt 3 ]]; then
    usage >&2
    exit 2
  fi
  target_path="${positional[0]}"
  branch="${positional[1]}"
  start_point="${positional[2]:-HEAD}"
fi

if [[ -z "$target_path" || -z "$branch" ]]; then
  echo "Both path and branch are required" >&2
  usage >&2
  exit 2
fi

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

if [[ "$skip_code_add" != "1" ]]; then
  if command -v code >/dev/null 2>&1; then
    code --add "$target_abs" || {
      echo "VS Code CLI failed to add the worktree. Workspace file was still updated." >&2
    }
  else
    echo "VS Code CLI 'code' not found. Workspace file was still updated." >&2
  fi
fi

echo "Worktree ready: $target_abs"
