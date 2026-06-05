#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
script="$script_dir/create-issue.sh"
tmp_dir="$(mktemp -d)"

cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

body_file="$tmp_dir/body.md"
comment_file="$tmp_dir/comment.md"
log_file="$tmp_dir/gh.log"
fake_bin="$tmp_dir/bin"
mkdir -p "$fake_bin"

cat >"$body_file" <<'BODY'
## Context

Parent: #65
Sub-issue of: #65

## Goal

검증용 body.
BODY

cat >"$comment_file" <<'COMMENT'
Added #{{issue_number}}: {{issue_url}}
COMMENT

cat >"$fake_bin/gh" <<'FAKE_GH'
#!/usr/bin/env bash
set -euo pipefail

log_file="${TASK_ADD_TEST_GH_LOG:?}"
printf '%s\n' "$*" >>"$log_file"

if [[ "$1" == "api" && "$2" == "repos/:owner/:repo/issues/65" && "${3:-}" == "--jq" && "${4:-}" == ".state" ]]; then
  printf 'open\n'
  exit 0
fi

if [[ "$1" == "api" && "$2" == "repos/:owner/:repo/issues/65" && "${3:-}" == "--jq" && "${4:-}" == ".labels[].name" ]]; then
  printf 'type:chore\nkind:umbrella\nstatus:in-progress\npriority:p1\narea:ops\n'
  exit 0
fi

if [[ "$1" == "api" && "$2" == "repos/:owner/:repo/issues/66" && "${3:-}" == "--jq" && "${4:-}" == ".state" ]]; then
  printf 'open\n'
  exit 0
fi

if [[ "$1" == "api" && "$2" == "repos/:owner/:repo/issues/66" && "${3:-}" == "--jq" && "${4:-}" == ".labels[].name" ]]; then
  printf 'type:chore\nkind:leaf\nstatus:done\npriority:p1\narea:ops\n'
  exit 0
fi

if [[ "$1" == "issue" && "$2" == "create" ]]; then
  printf 'https://github.com/yonghyeun/blog-app/issues/123\n'
  exit 0
fi

if [[ "$1" == "api" && "$2" == "repos/:owner/:repo/issues/123" && "${3:-}" == "--jq" && "${4:-}" == ".id" ]]; then
  printf '987\n'
  exit 0
fi

if [[ "$1" == "api" && "$2" == "repos/:owner/:repo/issues/65/sub_issues" ]]; then
  printf '{}\n'
  exit 0
fi

if [[ "$1" == "issue" && "$2" == "comment" && "$3" == "65" ]]; then
  printf 'https://github.com/yonghyeun/blog-app/issues/65#issuecomment-1\n'
  exit 0
fi

printf 'unexpected gh call: %s\n' "$*" >&2
exit 1
FAKE_GH

chmod +x "$fake_bin/gh"

run_valid_leaf() {
  PATH="$fake_bin:$PATH" TASK_ADD_TEST_GH_LOG="$log_file" "$script" \
    --kind leaf \
    --parent "#65" \
    --title "chore: 검증용 leaf 생성" \
    --body-file "$body_file" \
    --label type:chore \
    --label kind:leaf \
    --label status:intake \
    --label priority:p1 \
    --label area:ops \
    --parent-comment-file "$comment_file"
}

expect_failure() {
  local expected="$1"
  shift
  local stderr_file="$tmp_dir/failure.err"

  set +e
  PATH="$fake_bin:$PATH" TASK_ADD_TEST_GH_LOG="$log_file" "$script" "$@" >"$tmp_dir/failure.out" 2>"$stderr_file"
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

run_valid_leaf >"$tmp_dir/valid.out"

grep -Fq 'Created issue: https://github.com/yonghyeun/blog-app/issues/123' "$tmp_dir/valid.out" || {
  printf 'Expected created issue output. Check create-issue.sh success output.\n' >&2
  exit 1
}

grep -Fq 'repos/:owner/:repo/issues/65/sub_issues -X POST -F sub_issue_id=987' "$log_file" || {
  printf 'Expected sub-issue registration with -F integer field. Check create-issue.sh.\n' >&2
  cat "$log_file" >&2
  exit 1
}

expect_failure 'Expected exactly one type:* label' \
  --kind leaf \
  --parent "#65" \
  --title "chore: duplicate type" \
  --body-file "$body_file" \
  --label type:chore \
  --label type:docs \
  --label kind:leaf \
  --label status:intake \
  --label priority:p1 \
  --label area:ops

expect_failure 'Type label type:docs does not match title prefix chore' \
  --kind leaf \
  --parent "#65" \
  --title "chore: type mismatch" \
  --body-file "$body_file" \
  --label type:docs \
  --label kind:leaf \
  --label status:intake \
  --label priority:p1 \
  --label area:ops

expect_failure 'Kind label kind:standalone does not match --kind leaf' \
  --kind leaf \
  --parent "#65" \
  --title "chore: kind mismatch" \
  --body-file "$body_file" \
  --label type:chore \
  --label kind:standalone \
  --label status:intake \
  --label priority:p1 \
  --label area:ops

expect_failure 'Missing --parent for leaf issue' \
  --kind leaf \
  --title "chore: missing parent" \
  --body-file "$body_file" \
  --label type:chore \
  --label kind:leaf \
  --label status:intake \
  --label priority:p1 \
  --label area:ops

expect_failure 'Parent issue #66 is not labeled kind:umbrella' \
  --kind leaf \
  --parent "#66" \
  --title "chore: wrong parent" \
  --body-file "$body_file" \
  --label type:chore \
  --label kind:leaf \
  --label status:intake \
  --label priority:p1 \
  --label area:ops

printf 'task-add create-issue checks passed\n'
