#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
script="$script_dir/worktree-remove.sh"
tmp_dir="$(mktemp -d)"

cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

fake_bin="$tmp_dir/bin"
repo_root="$tmp_dir/main"
task_worktree="$tmp_dir/task"
git_log="$tmp_dir/git.log"
node_log="$tmp_dir/node.log"
mkdir -p "$fake_bin" "$repo_root" "$task_worktree"

cat >"$fake_bin/git" <<'FAKE_GIT'
#!/usr/bin/env bash
set -euo pipefail

repo_root="${TASK_CLOSE_REMOVE_TEST_REPO:?}"
task_worktree="${TASK_CLOSE_REMOVE_TEST_TASK:?}"
log_file="${TASK_CLOSE_REMOVE_TEST_GIT_LOG:?}"

printf '%s\n' "$*" >>"$log_file"

if [[ "$1" == "rev-parse" && "$2" == "--show-toplevel" ]]; then
  printf '%s\n' "$repo_root"
  exit 0
fi

if [[ "$1" == "-C" && "$3" == "worktree" && "$4" == "list" && "$5" == "--porcelain" ]]; then
  cat <<TREE
worktree $repo_root
HEAD abc123
branch refs/heads/main

worktree $task_worktree
HEAD def456
branch refs/heads/work/task
TREE
  exit 0
fi

if [[ "$1" == "-C" && "$3" == "worktree" && "$4" == "remove" ]]; then
  exit 0
fi

printf 'unexpected git call: %s\n' "$*" >&2
exit 1
FAKE_GIT

cat >"$fake_bin/node" <<'FAKE_NODE'
#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' "$*" >>"${TASK_CLOSE_REMOVE_TEST_NODE_LOG:?}"
printf 'Updated blog-worktrees.code-workspace\n'
printf 'Folders: 1\n'
FAKE_NODE

chmod +x "$fake_bin/git" "$fake_bin/node"

run_script() {
  PATH="$fake_bin:$PATH" \
    TASK_CLOSE_REMOVE_TEST_REPO="$repo_root" \
    TASK_CLOSE_REMOVE_TEST_TASK="$task_worktree" \
    TASK_CLOSE_REMOVE_TEST_GIT_LOG="$git_log" \
    TASK_CLOSE_REMOVE_TEST_NODE_LOG="$node_log" \
    "$script" "$@"
}

expect_failure() {
  local expected="$1"
  shift
  local stderr_file="$tmp_dir/failure.err"

  set +e
  run_script "$@" >"$tmp_dir/failure.out" 2>"$stderr_file"
  local status="$?"
  set -e

  if [[ "$status" -eq 0 ]]; then
    printf 'Expected command to fail: %s\n' "$expected" >&2
    exit 1
  fi

  if ! grep -Fq "$expected" "$stderr_file"; then
    printf 'Expected failure message missing: %s\n' "$expected" >&2
    cat "$stderr_file" >&2
    exit 1
  fi
}

expect_failure "Refusing to remove the main repository worktree: $repo_root" \
  --path "$repo_root" \
  --yes

run_script --path "$task_worktree" --yes >"$tmp_dir/success.out"

grep -Fq "Target worktree: $task_worktree" "$tmp_dir/success.out" || {
  printf 'Expected target worktree output.\n' >&2
  cat "$tmp_dir/success.out" >&2
  exit 1
}

grep -Fq -- "-C $repo_root worktree remove $task_worktree" "$git_log" || {
  printf 'Expected git worktree remove call.\n' >&2
  cat "$git_log" >&2
  exit 1
}

grep -Fq 'update-vscode-workspace.mjs' "$node_log" || {
  printf 'Expected workspace regeneration call.\n' >&2
  cat "$node_log" >&2
  exit 1
}

printf 'task-close worktree-remove checks passed\n'
