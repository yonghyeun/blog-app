#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
script="$script_dir/worktree-add.sh"
tmp_dir="$(mktemp -d)"

cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

fake_bin="$tmp_dir/bin"
repo_root="$tmp_dir/main"
worktree_parent="$tmp_dir/worktrees"
git_log="$tmp_dir/git.log"
node_log="$tmp_dir/node.log"
code_log="$tmp_dir/code.log"
mkdir -p "$fake_bin" "$repo_root" "$worktree_parent"

cat >"$fake_bin/git" <<'FAKE_GIT'
#!/usr/bin/env bash
set -euo pipefail

repo_root="${TASK_INTAKE_ADD_TEST_REPO:?}"
log_file="${TASK_INTAKE_ADD_TEST_GIT_LOG:?}"

printf '%s\n' "$*" >>"$log_file"

if [[ "$1" == "rev-parse" && "$2" == "--show-toplevel" ]]; then
  printf '%s\n' "$repo_root"
  exit 0
fi

if [[ "$1" == "-C" && "$3" == "show-ref" && "$4" == "--verify" && "$5" == "--quiet" ]]; then
  if [[ "$6" == "refs/heads/work/existing" ]]; then
    exit 0
  fi
  exit 1
fi

if [[ "$1" == "-C" && "$3" == "worktree" && "$4" == "add" ]]; then
  exit 0
fi

printf 'unexpected git call: %s\n' "$*" >&2
exit 1
FAKE_GIT

cat >"$fake_bin/node" <<'FAKE_NODE'
#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' "$*" >>"${TASK_INTAKE_ADD_TEST_NODE_LOG:?}"
printf 'Updated blog-worktrees.code-workspace\n'
printf 'Folders: 2\n'
FAKE_NODE

cat >"$fake_bin/code" <<'FAKE_CODE'
#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' "$*" >>"${TASK_INTAKE_ADD_TEST_CODE_LOG:?}"
FAKE_CODE

chmod +x "$fake_bin/git" "$fake_bin/node" "$fake_bin/code"

run_script() {
  PATH="$fake_bin:$PATH" \
    TASK_INTAKE_ADD_TEST_REPO="$repo_root" \
    TASK_INTAKE_ADD_TEST_GIT_LOG="$git_log" \
    TASK_INTAKE_ADD_TEST_NODE_LOG="$node_log" \
    TASK_INTAKE_ADD_TEST_CODE_LOG="$code_log" \
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

expect_failure 'Both path and branch are required' \
  --path "$worktree_parent/missing-branch"

run_script \
  --path "$worktree_parent/new-task" \
  --branch work/new \
  --base origin/main \
  --no-code-add >"$tmp_dir/new.out"

grep -Fq -- "-C $repo_root worktree add -b work/new $worktree_parent/new-task origin/main" "$git_log" || {
  printf 'Expected new branch worktree add call.\n' >&2
  cat "$git_log" >&2
  exit 1
}

if [[ -s "$code_log" ]]; then
  printf 'Expected --no-code-add to skip VS Code CLI.\n' >&2
  cat "$code_log" >&2
  exit 1
fi

run_script \
  --path "$worktree_parent/existing-task" \
  --branch work/existing >"$tmp_dir/existing.out"

grep -Fq -- "-C $repo_root worktree add $worktree_parent/existing-task work/existing" "$git_log" || {
  printf 'Expected existing branch worktree add call.\n' >&2
  cat "$git_log" >&2
  exit 1
}

grep -Fq -- "--add $worktree_parent/existing-task" "$code_log" || {
  printf 'Expected VS Code CLI add when not skipped.\n' >&2
  cat "$code_log" >&2
  exit 1
}

grep -Fq 'update-vscode-workspace.mjs' "$node_log" || {
  printf 'Expected workspace regeneration call.\n' >&2
  cat "$node_log" >&2
  exit 1
}

printf 'task-intake worktree-add checks passed\n'
