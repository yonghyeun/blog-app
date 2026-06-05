#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  run.sh --pr <number> [--dry-run] [--method squash|merge|rebase] [--wait] [options]
  run.sh --issue <number> [--dry-run] [--method squash|merge|rebase] [--wait] [options]

Options:
  --pr <number>                 Merge or inspect the given pull request.
  --issue <number>              Infer a single open PR related to the issue.
  --dry-run                     Verify readiness without merging.
  --method <squash|merge|rebase>  Merge method. Default: squash.
  --wait                        Wait for pending checks instead of failing immediately.
  --timeout <duration>          Wait bound. Supports seconds, 5m, or 1h. Default: 10m.
  --poll-interval <seconds>     Poll interval for waits. Default: 15.
  --skip-deploy-check           Skip deploy workflow detection only.
  --clean                       Delegate cleanup after verified merge.
  --json                        Emit a compact machine-readable result.
  --verbose                     Print inspected state.
  -h, --help                    Show this help.

Side effects:
  - --dry-run never merges or cleans.
  - Without --dry-run, merges only a ready PR.
  - --clean runs task-close worktree removal only after merge and post-merge CI verification.
USAGE
}

die() {
  local code="$1"
  shift
  printf '%s\n' "$*" >&2
  exit "$code"
}

info() {
  if [[ "$json" != "1" ]]; then
    printf '%s\n' "$*"
  fi
}

verbose() {
  if [[ "$verbose_mode" == "1" && "$json" != "1" ]]; then
    printf '%s\n' "$*"
  fi
}

normalize_number() {
  local raw="$1"
  raw="${raw#\#}"
  raw="${raw##*/pull/}"
  raw="${raw##*/issues/}"

  if [[ ! "$raw" =~ ^[0-9]+$ ]]; then
    die 2 "Invalid number: $1"
  fi

  printf '%s\n' "$raw"
}

parse_duration_seconds() {
  local raw="$1"

  if [[ "$raw" =~ ^[0-9]+$ ]]; then
    printf '%s\n' "$raw"
    return
  fi

  if [[ "$raw" =~ ^([0-9]+)s$ ]]; then
    printf '%s\n' "${BASH_REMATCH[1]}"
    return
  fi

  if [[ "$raw" =~ ^([0-9]+)m$ ]]; then
    printf '%s\n' "$((BASH_REMATCH[1] * 60))"
    return
  fi

  if [[ "$raw" =~ ^([0-9]+)h$ ]]; then
    printf '%s\n' "$((BASH_REMATCH[1] * 3600))"
    return
  fi

  die 2 "Invalid duration: $raw. Use seconds, 5m, or 1h."
}

json_string() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

gh_pr_value() {
  local pr_number="$1"
  local field="$2"
  local query="$3"

  gh pr view "$pr_number" --json "$field" --jq "$query"
}

infer_pr_from_issue() {
  local issue_number="$1"
  local matches

  if ! matches="$(gh pr list --state open --search "#${issue_number}" --json number --jq '.[].number')"; then
    die 1 "Could not search PRs for issue #${issue_number}."
  fi

  local count
  count="$(grep -c '^[0-9][0-9]*$' <<<"$matches" || true)"

  if [[ "$count" -eq 0 ]]; then
    die 3 "No open PR found for issue #${issue_number}. Pass --pr explicitly."
  fi

  if [[ "$count" -gt 1 ]]; then
    die 3 "Multiple open PRs found for issue #${issue_number}. Pass --pr explicitly."
  fi

  printf '%s\n' "$matches"
}

infer_pr_from_branch() {
  local branch
  branch="$(git branch --show-current)"

  if [[ -z "$branch" ]]; then
    die 3 "Current checkout is detached. Pass --pr explicitly."
  fi

  if ! gh pr view --json number --jq '.number'; then
    die 3 "No PR found for current branch $branch. Pass --pr explicitly."
  fi
}

classify_checks() {
  local pr_number="$1"
  local checks

  checks="$(gh pr view "$pr_number" --json statusCheckRollup --jq '.statusCheckRollup[]? | [(.name // .context // .workflowName // "unknown"), (.status // .state // ""), (.conclusion // .state // "")] | @tsv')"

  check_total=0
  check_passed=0
  check_pending=0
  check_failed=0
  check_failed_names=()
  check_pending_names=()

  if [[ -z "$checks" ]]; then
    return 0
  fi

  while IFS=$'\t' read -r name status conclusion; do
    [[ -n "$name" ]] || continue
    check_total=$((check_total + 1))

    local status_upper conclusion_upper
    status_upper="$(printf '%s' "$status" | tr '[:lower:]' '[:upper:]')"
    conclusion_upper="$(printf '%s' "$conclusion" | tr '[:lower:]' '[:upper:]')"

    case "$conclusion_upper" in
      SUCCESS|NEUTRAL|SKIPPED)
        check_passed=$((check_passed + 1))
        ;;
      FAILURE|FAILED|ERROR|TIMED_OUT|CANCELLED|CANCELED|ACTION_REQUIRED|STARTUP_FAILURE)
        check_failed=$((check_failed + 1))
        check_failed_names+=("$name")
        ;;
      "")
        case "$status_upper" in
          SUCCESS)
            check_passed=$((check_passed + 1))
            ;;
          FAILURE|FAILED|ERROR)
            check_failed=$((check_failed + 1))
            check_failed_names+=("$name")
            ;;
          *)
            check_pending=$((check_pending + 1))
            check_pending_names+=("$name")
            ;;
        esac
        ;;
      *)
        check_pending=$((check_pending + 1))
        check_pending_names+=("$name")
        ;;
    esac
  done <<<"$checks"
}

check_pr_ready_once() {
  local pr_number="$1"
  local state is_draft mergeable merge_state url head_sha

  state="$(gh_pr_value "$pr_number" state '.state')"
  is_draft="$(gh_pr_value "$pr_number" isDraft '.isDraft')"
  mergeable="$(gh_pr_value "$pr_number" mergeable '.mergeable')"
  merge_state="$(gh_pr_value "$pr_number" mergeStateStatus '.mergeStateStatus')"
  url="$(gh_pr_value "$pr_number" url '.url')"
  head_sha="$(gh_pr_value "$pr_number" headRefOid '.headRefOid')"

  pr_url="$url"
  pr_head_sha="$head_sha"

  verbose "PR: $url"
  verbose "state: $state"
  verbose "isDraft: $is_draft"
  verbose "mergeable: $mergeable"
  verbose "mergeStateStatus: $merge_state"
  verbose "headRefOid: $head_sha"

  if [[ "$state" != "OPEN" ]]; then
    die 4 "PR #${pr_number} is not open: $state"
  fi

  if [[ "$is_draft" == "true" ]]; then
    die 4 "PR #${pr_number} is a draft."
  fi

  if [[ "$mergeable" != "MERGEABLE" ]]; then
    die 4 "PR #${pr_number} is not mergeable: $mergeable"
  fi

  case "$merge_state" in
    CLEAN|HAS_HOOKS|UNSTABLE)
      ;;
    BLOCKED|BEHIND|DIRTY|DRAFT)
      die 4 "PR #${pr_number} merge state is not ready: $merge_state"
      ;;
    UNKNOWN|"")
      die 4 "PR #${pr_number} merge state is unknown. Retry after GitHub refreshes mergeability."
      ;;
    *)
      verbose "Unhandled mergeStateStatus treated through check rollup: $merge_state"
      ;;
  esac

  classify_checks "$pr_number"
  verbose "checks: total=$check_total passed=$check_passed pending=$check_pending failed=$check_failed"

  if [[ "$check_failed" -gt 0 ]]; then
    die 5 "PR #${pr_number} has failing checks: ${check_failed_names[*]}"
  fi

  if [[ "$check_pending" -gt 0 ]]; then
    return 10
  fi

  return 0
}

wait_for_pr_ready() {
  local pr_number="$1"
  local start elapsed status
  start="$SECONDS"

  while true; do
    set +e
    check_pr_ready_once "$pr_number"
    status="$?"
    set -e

    if [[ "$status" -eq 0 ]]; then
      return 0
    fi

    if [[ "$status" -ne 10 ]]; then
      exit "$status"
    fi

    if [[ "$wait" != "1" ]]; then
      die 5 "PR #${pr_number} has pending checks: ${check_pending_names[*]}. Rerun with --wait to poll."
    fi

    elapsed="$((SECONDS - start))"
    if [[ "$elapsed" -ge "$timeout_seconds" ]]; then
      die 5 "Timed out waiting for PR #${pr_number} checks: ${check_pending_names[*]}"
    fi

    info "Waiting for PR checks: ${check_pending_names[*]}"
    sleep "$poll_interval"
  done
}

merge_pr() {
  local pr_number="$1"
  local method_flag

  case "$method" in
    squash) method_flag="--squash" ;;
    merge) method_flag="--merge" ;;
    rebase) method_flag="--rebase" ;;
    *) die 2 "Unsupported merge method: $method" ;;
  esac

  gh pr merge "$pr_number" "$method_flag" --delete-branch
}

verify_merged_pr() {
  local pr_number="$1"
  local state merged_at commit_oid

  state="$(gh_pr_value "$pr_number" state '.state')"
  merged_at="$(gh_pr_value "$pr_number" mergedAt '.mergedAt // ""')"
  commit_oid="$(gh_pr_value "$pr_number" mergeCommit '.mergeCommit.oid // ""')"
  pr_url="$(gh_pr_value "$pr_number" url '.url')"

  if [[ "$state" != "MERGED" ]]; then
    die 6 "PR #${pr_number} merge command finished but PR state is $state."
  fi

  if [[ -z "$merged_at" || -z "$commit_oid" ]]; then
    die 6 "PR #${pr_number} is merged but merge metadata is incomplete."
  fi

  merge_commit="$commit_oid"
  info "Merged PR: $pr_url"
  info "Merge commit: $merge_commit"
}

verify_closing_issues() {
  local pr_number="$1"
  local issue_numbers issue_number issue_state

  issue_numbers="$(gh pr view "$pr_number" --json closingIssuesReferences --jq '.closingIssuesReferences[].number' 2>/dev/null || true)"

  if [[ -z "$issue_numbers" ]]; then
    issue_state_summary="skipped:no-closing-issue-reference"
    info "Issue verification: skipped, no closing issue reference detected."
    return 0
  fi

  while read -r issue_number; do
    [[ -n "$issue_number" ]] || continue
    issue_state="$(gh issue view "$issue_number" --json state --jq '.state')"
    if [[ "$issue_state" != "CLOSED" ]]; then
      die 6 "Closing issue #${issue_number} is not closed after merge: $issue_state"
    fi
  done <<<"$issue_numbers"

  issue_state_summary="closed:${issue_numbers//$'\n'/,}"
  info "Issue verification: $issue_state_summary"
}

classify_runs_for_sha() {
  local sha="$1"
  local runs

  runs="$(gh run list --commit "$sha" --limit 20 --json workflowName,status,conclusion,headSha,url --jq '.[] | [(.workflowName // "unknown"), (.status // ""), (.conclusion // ""), (.url // "")] | @tsv')"

  run_total=0
  run_passed=0
  run_pending=0
  run_failed=0
  run_failed_names=()
  run_pending_names=()

  if [[ -z "$runs" ]]; then
    return 0
  fi

  while IFS=$'\t' read -r workflow status conclusion url; do
    [[ -n "$workflow" ]] || continue
    run_total=$((run_total + 1))

    local status_upper conclusion_upper
    status_upper="$(printf '%s' "$status" | tr '[:lower:]' '[:upper:]')"
    conclusion_upper="$(printf '%s' "$conclusion" | tr '[:lower:]' '[:upper:]')"
    : "$url"

    case "$conclusion_upper" in
      SUCCESS|NEUTRAL|SKIPPED)
        run_passed=$((run_passed + 1))
        ;;
      FAILURE|FAILED|ERROR|TIMED_OUT|CANCELLED|CANCELED|ACTION_REQUIRED|STARTUP_FAILURE)
        run_failed=$((run_failed + 1))
        run_failed_names+=("$workflow")
        ;;
      "")
        case "$status_upper" in
          COMPLETED|SUCCESS)
            run_passed=$((run_passed + 1))
            ;;
          *)
            run_pending=$((run_pending + 1))
            run_pending_names+=("$workflow")
            ;;
        esac
        ;;
      *)
        run_pending=$((run_pending + 1))
        run_pending_names+=("$workflow")
        ;;
    esac
  done <<<"$runs"
}

verify_post_merge_ci() {
  local sha="$1"
  local start elapsed
  start="$SECONDS"

  while true; do
    classify_runs_for_sha "$sha"
    verbose "post-merge runs: total=$run_total passed=$run_passed pending=$run_pending failed=$run_failed"

    if [[ "$run_failed" -gt 0 ]]; then
      die 7 "Post-merge CI failed for $sha: ${run_failed_names[*]}"
    fi

    if [[ "$run_total" -gt 0 && "$run_pending" -eq 0 ]]; then
      post_merge_ci_summary="passed:${run_passed}/${run_total}"
      info "Post-merge CI: $post_merge_ci_summary"
      return 0
    fi

    if [[ "$wait" != "1" ]]; then
      die 7 "Post-merge CI is not complete for $sha. Rerun with --wait to poll."
    fi

    elapsed="$((SECONDS - start))"
    if [[ "$elapsed" -ge "$timeout_seconds" ]]; then
      die 7 "Timed out waiting for post-merge CI for $sha."
    fi

    if [[ "$run_total" -eq 0 ]]; then
      info "Waiting for post-merge CI runs to appear for $sha"
    else
      info "Waiting for post-merge CI: ${run_pending_names[*]}"
    fi
    sleep "$poll_interval"
  done
}

detect_deploy_workflow() {
  if [[ "$skip_deploy_check" == "1" ]]; then
    deploy_summary="skipped:explicit"
    info "Deploy verification: skipped by --skip-deploy-check."
    return 0
  fi

  if [[ ! -d ".github/workflows" ]]; then
    deploy_summary="skipped:no-workflow-directory"
    info "Deploy verification: skipped, no .github/workflows directory."
    return 0
  fi

  if find .github/workflows -type f \( -name '*.yml' -o -name '*.yaml' \) -print0 |
    xargs -0 grep -Eil 'deploy|release|production|cd' >/dev/null 2>&1; then
    deploy_summary="manual-review:deploy-workflow-detected"
    info "Deploy verification: deploy-like workflow detected. Verify platform-specific status manually."
  else
    deploy_summary="skipped:no-deploy-workflow"
    info "Deploy verification: skipped, no deploy-like workflow detected."
  fi
}

delegate_cleanup() {
  local repo_root close_script main_worktree

  repo_root="$(git rev-parse --show-toplevel)"
  close_script="$repo_root/.codex/skills/task-close/scripts/worktree-remove.sh"
  main_worktree="$(git -C "$repo_root" worktree list --porcelain | awk 'NR == 1 { print $2 }')"

  if [[ ! -x "$close_script" ]]; then
    die 8 "--clean requested but task-close worktree removal script is unavailable: $close_script"
  fi

  if [[ "$repo_root" == "$main_worktree" ]]; then
    die 8 "--clean requested from the main worktree. Run task-close with an explicit task worktree instead."
  fi

  info "Cleanup delegation: $close_script --path $repo_root --yes"
  "$close_script" --path "$repo_root" --yes
}

pr=""
issue=""
dry_run="0"
method="squash"
wait="0"
timeout_raw="10m"
poll_interval="15"
skip_deploy_check="0"
clean="0"
json="0"
verbose_mode="0"

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --pr)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --pr."
      pr="$(normalize_number "$2")"
      shift 2
      ;;
    --issue)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --issue."
      issue="$(normalize_number "$2")"
      shift 2
      ;;
    --dry-run)
      dry_run="1"
      shift
      ;;
    --method)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --method."
      method="$2"
      shift 2
      ;;
    --wait)
      wait="1"
      shift
      ;;
    --timeout)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --timeout."
      timeout_raw="$2"
      shift 2
      ;;
    --poll-interval)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --poll-interval."
      poll_interval="$2"
      shift 2
      ;;
    --skip-deploy-check)
      skip_deploy_check="1"
      shift
      ;;
    --clean)
      clean="1"
      shift
      ;;
    --json)
      json="1"
      shift
      ;;
    --verbose)
      verbose_mode="1"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die 2 "Unknown argument: $1. Run run.sh --help."
      ;;
  esac
done

case "$method" in
  squash|merge|rebase) ;;
  *) die 2 "Unsupported --method: $method. Use squash, merge, or rebase." ;;
esac

if [[ ! "$poll_interval" =~ ^[0-9]+$ || "$poll_interval" -lt 1 ]]; then
  die 2 "--poll-interval must be a positive integer."
fi

timeout_seconds="$(parse_duration_seconds "$timeout_raw")"

if [[ -n "$pr" && -n "$issue" ]]; then
  die 2 "Pass either --pr or --issue, not both."
fi

if [[ -z "$pr" ]]; then
  if [[ -n "$issue" ]]; then
    pr="$(infer_pr_from_issue "$issue")"
  else
    pr="$(infer_pr_from_branch)"
  fi
fi

pr_url=""
pr_head_sha=""
merge_commit=""
issue_state_summary="not-checked"
post_merge_ci_summary="not-run"
deploy_summary="not-run"

wait_for_pr_ready "$pr"

if [[ "$dry_run" == "1" ]]; then
  if [[ "$json" == "1" ]]; then
    printf '{"pr":%s,"url":"%s","ready":true,"dryRun":true,"method":"%s","headSha":"%s","checks":{"total":%s,"passed":%s,"pending":%s,"failed":%s}}\n' \
      "$pr" "$(json_string "$pr_url")" "$(json_string "$method")" "$(json_string "$pr_head_sha")" \
      "$check_total" "$check_passed" "$check_pending" "$check_failed"
  else
    printf 'task-merge dry run passed\n'
    printf 'PR: %s\n' "$pr_url"
    printf 'method: %s\n' "$method"
    printf 'head sha: %s\n' "$pr_head_sha"
    printf 'checks: total=%s passed=%s pending=%s failed=%s\n' "$check_total" "$check_passed" "$check_pending" "$check_failed"
    if [[ "$clean" == "1" ]]; then
      printf 'cleanup: would delegate after verified merge\n'
    fi
  fi
  exit 0
fi

merge_pr "$pr"
verify_merged_pr "$pr"
verify_closing_issues "$pr"
verify_post_merge_ci "$merge_commit"
detect_deploy_workflow

if [[ "$clean" == "1" ]]; then
  delegate_cleanup
else
  info "Cleanup: skipped. Run task-close when workspace cleanup is desired."
fi

if [[ "$json" == "1" ]]; then
  printf '{"pr":%s,"url":"%s","ready":true,"dryRun":false,"method":"%s","mergeCommit":"%s","issueState":"%s","postMergeCi":"%s","deploy":"%s","clean":%s}\n' \
    "$pr" "$(json_string "$pr_url")" "$(json_string "$method")" "$(json_string "$merge_commit")" \
    "$(json_string "$issue_state_summary")" "$(json_string "$post_merge_ci_summary")" "$(json_string "$deploy_summary")" "$clean"
fi
