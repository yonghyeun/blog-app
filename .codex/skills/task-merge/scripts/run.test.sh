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
log_file="$tmp_dir/gh.log"
state_file="$tmp_dir/state"
mkdir -p "$fake_bin"
printf 'ready\n' >"$state_file"

cat >"$fake_bin/gh" <<'FAKE_GH'
#!/usr/bin/env bash
set -euo pipefail

log_file="${TASK_MERGE_TEST_GH_LOG:?}"
state_file="${TASK_MERGE_TEST_STATE:?}"
state="$(cat "$state_file")"
printf '%s\n' "$*" >>"$log_file"

if [[ "$1" == "pr" && "$2" == "view" ]]; then
  pr="${3:-}"
  shift 3
  field=""
  jq_query=""
  while [[ "$#" -gt 0 ]]; do
    case "$1" in
      --json)
        field="$2"
        shift 2
        ;;
      --jq)
        jq_query="$2"
        shift 2
        ;;
      *)
        shift
        ;;
    esac
  done

  case "$field:$jq_query" in
    state:.state)
      if [[ "$state" == "closed" ]]; then
        printf 'CLOSED\n'
      elif [[ "$state" == "merged" ]]; then
        printf 'MERGED\n'
      else
        printf 'OPEN\n'
      fi
      exit 0
      ;;
    isDraft:.isDraft)
      if [[ "$state" == "draft" ]]; then
        printf 'true\n'
      else
        printf 'false\n'
      fi
      exit 0
      ;;
    mergeable:.mergeable)
      if [[ "$state" == "conflict" ]]; then
        printf 'CONFLICTING\n'
      else
        printf 'MERGEABLE\n'
      fi
      exit 0
      ;;
    mergeStateStatus:.mergeStateStatus)
      if [[ "$state" == "blocked" ]]; then
        printf 'BLOCKED\n'
      else
        printf 'CLEAN\n'
      fi
      exit 0
      ;;
    url:.url)
      printf 'https://github.com/yonghyeun/blog-app/pull/%s\n' "$pr"
      exit 0
      ;;
    headRefOid:.headRefOid)
      printf 'abc123head\n'
      exit 0
      ;;
    statusCheckRollup:*)
      if [[ "$state" == "failing-check" ]]; then
        printf 'quality-gate\tCOMPLETED\tFAILURE\n'
      elif [[ "$state" == "pending-check" ]]; then
        printf 'quality-gate\tIN_PROGRESS\t\n'
      else
        printf 'quality-gate\tCOMPLETED\tSUCCESS\n'
      fi
      exit 0
      ;;
    mergedAt:*)
      printf '2026-06-05T00:00:00Z\n'
      exit 0
      ;;
    mergeCommit:*)
      printf 'abc123merge\n'
      exit 0
      ;;
    closingIssuesReferences:*)
      printf '100\n'
      exit 0
      ;;
  esac
fi

if [[ "$1" == "issue" && "$2" == "view" && "$3" == "100" ]]; then
  printf 'CLOSED\n'
  exit 0
fi

if [[ "$1" == "pr" && "$2" == "merge" ]]; then
  printf 'merged\n'
  printf 'merged\n' >"$state_file"
  exit 0
fi

if [[ "$1" == "run" && "$2" == "list" ]]; then
  printf 'quality-gate\tcompleted\tsuccess\thttps://github.com/yonghyeun/blog-app/actions/runs/1\n'
  exit 0
fi

if [[ "$1" == "pr" && "$2" == "list" ]]; then
  printf '42\n'
  exit 0
fi

printf 'unexpected gh call: %s\n' "$*" >&2
exit 1
FAKE_GH

chmod +x "$fake_bin/gh"

run_script() {
  PATH="$fake_bin:$PATH" TASK_MERGE_TEST_GH_LOG="$log_file" TASK_MERGE_TEST_STATE="$state_file" "$script" "$@"
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

bash -n "$script"

printf 'ready\n' >"$state_file"
run_script --pr 42 --dry-run >"$tmp_dir/dry-run.out"
grep -Fq 'task-merge dry run passed' "$tmp_dir/dry-run.out" || {
  printf 'Expected dry-run success output.\n' >&2
  cat "$tmp_dir/dry-run.out" >&2
  exit 1
}

printf 'failing-check\n' >"$state_file"
expect_failure 'has failing checks' --pr 42 --dry-run

printf 'conflict\n' >"$state_file"
expect_failure 'is not mergeable' --pr 42 --dry-run

printf 'pending-check\n' >"$state_file"
expect_failure 'has pending checks' --pr 42 --dry-run

printf 'ready\n' >"$state_file"
run_script --pr 42 --method squash --skip-deploy-check >"$tmp_dir/merge.out"

grep -Fq 'pr merge 42 --squash --delete-branch' "$log_file" || {
  printf 'Expected squash merge command.\n' >&2
  cat "$log_file" >&2
  exit 1
}

grep -Fq 'Post-merge CI: passed:1/1' "$tmp_dir/merge.out" || {
  printf 'Expected post-merge CI verification.\n' >&2
  cat "$tmp_dir/merge.out" >&2
  exit 1
}

printf 'task-merge run checks passed\n'
