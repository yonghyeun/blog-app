#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
script="$script_dir/run.sh"
tmp_dir="$(mktemp -d)"

cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

fake_bin="$tmp_dir/bin"
main_worktree="$tmp_dir/main"
task_worktree="$tmp_dir/task"
log_file="$tmp_dir/gh.log"
mkdir -p "$fake_bin" "$main_worktree" "$task_worktree"
: >"$log_file"

cat >"$fake_bin/gh" <<'FAKE_GH'
#!/usr/bin/env bash
set -euo pipefail

log_file="${TASK_CLOSE_TEST_GH_LOG:?}"
printf '%s\n' "$*" >>"$log_file"

if [[ "$1" == "issue" && "$2" == "view" && "$3" == "101" ]]; then
  case "$7" in
    .state) printf 'OPEN\n' ;;
    .url) printf 'https://github.com/yonghyeun/blog-app/issues/101\n' ;;
    .title) printf 'chore: task-close script-first gate 정착\n' ;;
    '.labels[].name') printf 'type:chore\nkind:leaf\nstatus:ready\npriority:p1\narea:ops\n' ;;
    *) printf 'unexpected issue jq: %s\n' "$7" >&2; exit 1 ;;
  esac
  exit 0
fi

if [[ "$1" == "pr" && "$2" == "view" && "$3" == "97" ]]; then
  case "$7" in
    .state) printf 'OPEN\n' ;;
    .url) printf 'https://github.com/yonghyeun/blog-app/pull/97\n' ;;
    .headRefName) printf 'work/101-task-close-script-first\n' ;;
    .headRefOid) printf 'abc123\n' ;;
    *) printf 'unexpected pr jq: %s\n' "$7" >&2; exit 1 ;;
  esac
  exit 0
fi

if [[ "$1" == "issue" && "$2" == "comment" && "$3" == "101" ]]; then
  printf 'https://github.com/yonghyeun/blog-app/issues/101#issuecomment-test\n'
  exit 0
fi

if [[ "$1" == "issue" && "$2" == "edit" && "$3" == "101" ]]; then
  printf 'https://github.com/yonghyeun/blog-app/issues/101\n'
  exit 0
fi

printf 'unexpected gh call: %s\n' "$*" >&2
exit 1
FAKE_GH

cat >"$fake_bin/git" <<'FAKE_GIT'
#!/usr/bin/env bash
set -euo pipefail

main="${TASK_CLOSE_TEST_MAIN:?}"
task="${TASK_CLOSE_TEST_TASK:?}"

if [[ "$1" == "rev-parse" && "$2" == "--show-toplevel" ]]; then
  printf '%s\n' "$main"
  exit 0
fi

if [[ "$1" == "-C" && "$3" == "rev-parse" && "$4" == "HEAD" ]]; then
  printf 'abc123\n'
  exit 0
fi

if [[ "$1" == "-C" && "$3" == "worktree" && "$4" == "list" && "$5" == "--porcelain" ]]; then
  cat <<TREE
worktree $main
HEAD abc123
branch refs/heads/main

worktree $task
HEAD abc123
branch refs/heads/work/101-task-close-script-first
TREE
  exit 0
fi

if [[ "$1" == "-C" && "$3" == "status" && "$4" == "--porcelain" ]]; then
  if [[ "${TASK_CLOSE_TEST_DIRTY:-0}" == "1" ]]; then
    printf ' M .codex/skills/task-close/SKILL.md\n'
  fi
  exit 0
fi

if [[ "$1" == "-C" && "$3" == "rev-parse" && "$4" == "--abbrev-ref" ]]; then
  printf 'origin/main\n'
  exit 0
fi

if [[ "$1" == "-C" && "$3" == "rev-list" && "$4" == "--count" ]]; then
  printf '%s\n' "${TASK_CLOSE_TEST_AHEAD:-0}"
  exit 0
fi

if [[ "$1" == "-C" && "$3" == "log" ]]; then
  printf 'abc123 chore: task-close gate\n'
  exit 0
fi

printf 'unexpected git call: %s\n' "$*" >&2
exit 1
FAKE_GIT

chmod +x "$fake_bin/gh" "$fake_bin/git"

run_with_fakes() {
  PATH="$fake_bin:$PATH" \
    TASK_CLOSE_TEST_GH_LOG="$log_file" \
    TASK_CLOSE_TEST_MAIN="$main_worktree" \
    TASK_CLOSE_TEST_TASK="$task_worktree" \
    "$script" "$@"
}

expect_failure() {
  local expected="$1"
  shift
  local stderr_file="$tmp_dir/failure.err"

  set +e
  run_with_fakes "$@" >"$tmp_dir/failure.out" 2>"$stderr_file"
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

run_with_fakes \
  --mode handoff \
  --issue 101 \
  --pr 97 \
  --worktree "$task_worktree" \
  --workspace keep \
  --dry-run \
  --verbose >"$tmp_dir/dry-run.out"

grep -Fq 'task-close dry run passed' "$tmp_dir/dry-run.out" || {
  printf 'Expected dry-run pass output.\n' >&2
  cat "$tmp_dir/dry-run.out" >&2
  exit 1
}

grep -Fq 'workspace-decision: keep' "$tmp_dir/dry-run.out" || {
  printf 'Expected workspace decision output.\n' >&2
  cat "$tmp_dir/dry-run.out" >&2
  exit 1
}

expect_failure 'Refusing to remove main worktree' \
  --mode workspace-cleanup \
  --issue 101 \
  --worktree "$main_worktree" \
  --workspace remove \
  --dry-run

TASK_CLOSE_TEST_DIRTY=1 expect_failure 'Workspace has uncommitted changes' \
  --mode workspace-cleanup \
  --issue 101 \
  --worktree "$task_worktree" \
  --workspace remove \
  --dry-run

run_with_fakes \
  --mode handoff \
  --issue 101 \
  --pr 97 \
  --worktree "$task_worktree" \
  --workspace keep \
  --yes >"$tmp_dir/mutate.out"

grep -Fq 'issue comment 101' "$log_file" || {
  printf 'Expected closeout receipt comment call.\n' >&2
  cat "$log_file" >&2
  exit 1
}

grep -Fq 'issue edit 101 --remove-label status:ready --add-label status:review' "$log_file" || {
  printf 'Expected status:review sync call.\n' >&2
  cat "$log_file" >&2
  exit 1
}

printf 'task-close run.sh checks passed\n'
