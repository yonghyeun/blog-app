#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  .codex/skills/task-close/scripts/worktree-remove.sh <path> [--yes] [--force]
  .codex/skills/task-close/scripts/worktree-remove.sh --path <path> [--yes] [--force]

Examples:
  .codex/skills/task-close/scripts/worktree-remove.sh ../app-issue-56
  .codex/skills/task-close/scripts/worktree-remove.sh ../app-issue-56 --yes
  .codex/skills/task-close/scripts/worktree-remove.sh --path ../app-issue-56 --yes

Behavior:
  - Removes the git worktree at <path>.
  - Requires an explicit path that is already registered as a git worktree.
  - Refuses to remove the main repository worktree.
  - Rebuilds blog-worktrees.code-workspace after removal.
  - Does not delete the branch.
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

target_path=""
confirm="0"
force="0"
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
    --yes)
      confirm="1"
      shift
      ;;
    --force)
      force="1"
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
  if [[ -n "$target_path" ]]; then
    echo "Do not mix positional path with --path" >&2
    usage >&2
    exit 2
  fi
  if [[ "${#positional[@]}" -ne 1 ]]; then
    usage >&2
    exit 2
  fi
  target_path="${positional[0]}"
fi

if [[ -z "$target_path" ]]; then
  echo "Path is required" >&2
  usage >&2
  exit 2
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(git rev-parse --show-toplevel)"

if [[ ! -d "$target_path" ]]; then
  echo "Worktree path does not exist: $target_path" >&2
  exit 1
fi

target_abs="$(cd "$target_path" && pwd -P)"
main_worktree="$(git -C "$repo_root" worktree list --porcelain | awk 'NR == 1 { print $2 }')"

if [[ "$target_abs" == "$main_worktree" ]]; then
  echo "Refusing to remove the main repository worktree: $target_abs" >&2
  exit 1
fi

if ! git -C "$repo_root" worktree list --porcelain | awk '/^worktree / { print substr($0, 10) }' | grep -Fxq "$target_abs"; then
  echo "Path is not registered as a git worktree: $target_abs" >&2
  exit 1
fi

branch="$(
  git -C "$repo_root" worktree list --porcelain |
    awk -v target="$target_abs" '
      /^worktree / { current = substr($0, 10) }
      current == target && /^branch / { print substr($0, 8) }
    '
)"

echo "Target worktree: $target_abs"
echo "Branch: ${branch:-detached}"
echo "Branch deletion: not performed"

if [[ "$confirm" != "1" ]]; then
  read -r -p "Type 'remove' to remove this worktree: " answer
  if [[ "$answer" != "remove" ]]; then
    echo "Canceled."
    exit 1
  fi
fi

remove_args=(worktree remove)
if [[ "$force" == "1" ]]; then
  remove_args+=(--force)
fi
remove_args+=("$target_abs")

git -C "$repo_root" "${remove_args[@]}"

node "$script_dir/update-vscode-workspace.mjs"

echo "Worktree removed: $target_abs"
