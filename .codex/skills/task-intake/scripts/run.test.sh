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
mkdir -p "$fake_bin"
gh_log="$tmp_dir/gh.log"
worktree_log="$tmp_dir/worktree.log"

cat >"$fake_bin/gh" <<'FAKE_GH'
#!/usr/bin/env bash
set -euo pipefail

log_file="${TASK_INTAKE_TEST_GH_LOG:?}"
printf '%s\n' "$*" >>"$log_file"

if [[ "$1" == "api" && "$2" == "repos/:owner/:repo/issues/99" ]]; then
  case "${4:-}" in
    ".title")
      printf 'chore: task-intake script-first gate 정착\n'
      ;;
    ".state")
      printf 'open\n'
      ;;
    ".body // \"\"")
      cat <<'BODY'
## Relationship

Parent: #65
Sub-issue of: #65
Depends on: #96

## Scope

- Add task-intake script-first gate.

## Non-Scope

- Do not modify task-merge.

## Acceptance Criteria

- [ ] Gate validates intake requirements.

## Completion Signal

Script can prepare intake before implementation.
BODY
      ;;
    ".labels[].name")
      printf 'type:chore\nkind:leaf\nstatus:intake\npriority:p1\narea:ops\n'
      ;;
    *)
      printf 'unexpected jq for issue 99: %s\n' "${4:-}" >&2
      exit 1
      ;;
  esac
  exit 0
fi

if [[ "$1" == "api" && "$2" == "repos/:owner/:repo/issues/65" ]]; then
  case "${4:-}" in
    ".state")
      printf 'open\n'
      ;;
    ".labels[].name")
      printf 'type:chore\nkind:umbrella\nstatus:in-progress\npriority:p1\narea:ops\n'
      ;;
    *)
      printf 'unexpected jq for issue 65: %s\n' "${4:-}" >&2
      exit 1
      ;;
  esac
  exit 0
fi

if [[ "$1" == "api" && "$2" == "repos/:owner/:repo/issues/100" ]]; then
  case "${4:-}" in
    ".title")
      printf 'chore: missing intake fields\n'
      ;;
    ".state")
      printf 'open\n'
      ;;
    ".body // \"\"")
      cat <<'BODY'
## Scope

- Too little.
BODY
      ;;
    ".labels[].name")
      printf 'type:chore\nkind:leaf\nstatus:intake\npriority:p1\narea:ops\n'
      ;;
  esac
  exit 0
fi

if [[ "$1" == "issue" && "$2" == "edit" && "$3" == "99" ]]; then
  printf 'https://github.com/yonghyeun/blog-app/issues/99\n'
  exit 0
fi

if [[ "$1" == "issue" && "$2" == "comment" && "$3" == "99" ]]; then
  printf 'https://github.com/yonghyeun/blog-app/issues/99#issuecomment-1\n'
  exit 0
fi

printf 'unexpected gh call: %s\n' "$*" >&2
exit 1
FAKE_GH

cat >"$tmp_dir/worktree-add.sh" <<'FAKE_WORKTREE'
#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' "$*" >>"${TASK_INTAKE_TEST_WORKTREE_LOG:?}"
printf 'Worktree ready: %s\n' "$2"
FAKE_WORKTREE

chmod +x "$fake_bin/gh" "$tmp_dir/worktree-add.sh"

run_script() {
  PATH="$fake_bin:$PATH" \
    TASK_INTAKE_TEST_GH_LOG="$gh_log" \
    TASK_INTAKE_TEST_WORKTREE_LOG="$worktree_log" \
    TASK_INTAKE_WORKTREE_ADD_SH="$tmp_dir/worktree-add.sh" \
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

run_script --issue 99 --check-only >"$tmp_dir/check.out"
grep -Fq 'task-intake validation passed' "$tmp_dir/check.out"
grep -Fq 'status-sync: would promote status:intake to status:ready in mutation mode' "$tmp_dir/check.out"

run_script --issue 99 --worktree ../app-issue-99 --branch work/99-task-intake --dry-run --no-code-add >"$tmp_dir/dry-run.out"
grep -Fq 'mode: dry-run' "$tmp_dir/dry-run.out"
grep -Fq 'remote mutations:' "$tmp_dir/dry-run.out"
grep -Fq 'local mutations:' "$tmp_dir/dry-run.out"

run_script --issue 99 --worktree ../app-issue-99 --branch work/99-task-intake --no-code-add >"$tmp_dir/mutate.out"
grep -Fq 'Updated issue #99 status:intake -> status:ready' "$tmp_dir/mutate.out"
grep -Fq 'Intake receipt: https://github.com/yonghyeun/blog-app/issues/99#issuecomment-1' "$tmp_dir/mutate.out"
grep -Fq -- '--path ../app-issue-99 --branch work/99-task-intake --base origin/main --no-code-add' "$worktree_log"
grep -Fq -- 'issue edit 99 --remove-label status:intake --add-label status:ready' "$gh_log"
grep -Fq -- 'issue comment 99 --body-file' "$gh_log"

expect_failure 'GitHub issue is missing Non-Scope' --issue 100 --check-only
expect_failure 'Issue #99 is still status:intake' --issue 99 --worktree ../app-issue-99 --branch work/99-task-intake --no-fix-issue
expect_failure 'Missing --issue' --check-only

printf 'task-intake run checks passed\n'
