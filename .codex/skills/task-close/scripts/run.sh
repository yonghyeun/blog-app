#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  task-close run.sh --mode <handoff|merged|workspace-cleanup> [options]

Options:
  --issue <number>                 Issue used for receipt and status sync.
  --pr <number>                    Pull request used for terminal state checks.
  --worktree <path>                Workspace path to inspect or clean up.
  --workspace <keep|remove|pending> Workspace decision.
  --dry-run                        Validate and print the planned closeout only.
  --json                           Emit a compact JSON summary.
  --verbose                        Include inspected state in text output.
  --yes                            Confirm safe mutations and cleanup delegation.
  --force                          Allow forced cleanup delegation after safety checks.
  -h, --help                       Show this help.

Side effects without --dry-run:
  - Writes a closeout receipt comment to the issue when --issue is provided.
  - Syncs status labels for handoff and merged modes.
  - Delegates workspace removal to worktree-remove.sh when --workspace remove.
USAGE
}

die() {
  local code="$1"
  shift
  printf '%s\n' "$*" >&2
  exit "$code"
}

json_escape() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  value="${value//$'\n'/\\n}"
  printf '%s' "$value"
}

normalize_issue_number() {
  local raw="$1"
  raw="${raw#\#}"
  raw="${raw##*/issues/}"

  if [[ ! "$raw" =~ ^[0-9]+$ ]]; then
    die 2 "Invalid issue number: $1"
  fi

  printf '%s\n' "$raw"
}

normalize_pr_number() {
  local raw="$1"
  raw="${raw#\#}"
  raw="${raw##*/pull/}"

  if [[ ! "$raw" =~ ^[0-9]+$ ]]; then
    die 2 "Invalid PR number: $1"
  fi

  printf '%s\n' "$raw"
}

contains_status_label() {
  local target="$1"
  local label
  for label in "${issue_labels[@]}"; do
    if [[ "$label" == "$target" ]]; then
      return 0
    fi
  done
  return 1
}

mode=""
issue=""
pr=""
worktree=""
workspace_decision=""
dry_run="0"
json="0"
verbose="0"
yes="0"
force="0"

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --mode)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --mode"
      mode="$2"
      shift 2
      ;;
    --issue)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --issue"
      issue="$(normalize_issue_number "$2")"
      shift 2
      ;;
    --pr)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --pr"
      pr="$(normalize_pr_number "$2")"
      shift 2
      ;;
    --worktree)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --worktree"
      worktree="$2"
      shift 2
      ;;
    --workspace)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --workspace"
      workspace_decision="$2"
      shift 2
      ;;
    --dry-run)
      dry_run="1"
      shift
      ;;
    --json)
      json="1"
      shift
      ;;
    --verbose)
      verbose="1"
      shift
      ;;
    --yes)
      yes="1"
      shift
      ;;
    --force)
      force="1"
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

case "$mode" in
  handoff|merged|workspace-cleanup)
    ;;
  "")
    die 2 "Missing --mode. Pass handoff, merged, or workspace-cleanup."
    ;;
  *)
    die 2 "Unsupported --mode: $mode"
    ;;
esac

case "$workspace_decision" in
  keep|remove|pending)
    ;;
  "")
    case "$mode" in
      handoff) workspace_decision="keep" ;;
      merged) workspace_decision="pending" ;;
      workspace-cleanup) die 2 "--workspace is required for workspace-cleanup mode" ;;
    esac
    ;;
  *)
    die 2 "Unsupported --workspace: $workspace_decision"
    ;;
esac

if [[ "$workspace_decision" == "remove" && "$yes" != "1" && "$dry_run" != "1" ]]; then
  die 2 "--workspace remove requires --yes for non-dry-run cleanup"
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(git rev-parse --show-toplevel)"
head_sha="$(git -C "$repo_root" rev-parse HEAD)"

issue_state=""
issue_url=""
issue_title=""
issue_labels=()

if [[ -n "$issue" ]]; then
  issue_state="$(gh issue view "$issue" --json state --jq '.state')"
  issue_url="$(gh issue view "$issue" --json url --jq '.url')"
  issue_title="$(gh issue view "$issue" --json title --jq '.title')"
  mapfile -t issue_labels < <(gh issue view "$issue" --json labels --jq '.labels[].name')
fi

pr_state=""
pr_url=""
pr_branch=""
pr_head_sha=""

if [[ -n "$pr" ]]; then
  pr_state="$(gh pr view "$pr" --json state --jq '.state')"
  pr_url="$(gh pr view "$pr" --json url --jq '.url')"
  pr_branch="$(gh pr view "$pr" --json headRefName --jq '.headRefName')"
  pr_head_sha="$(gh pr view "$pr" --json headRefOid --jq '.headRefOid')"
fi

case "$mode" in
  handoff)
    [[ -n "$pr" ]] || die 2 "handoff mode requires --pr"
    [[ "$pr_state" == "OPEN" ]] || die 3 "handoff mode requires an OPEN PR. PR #$pr is $pr_state."
    ;;
  merged)
    [[ -n "$pr" ]] || die 2 "merged mode requires --pr"
    [[ "$pr_state" == "MERGED" ]] || die 3 "merged mode requires a MERGED PR. PR #$pr is $pr_state."
    ;;
  workspace-cleanup)
    ;;
esac

if [[ -n "$issue" ]]; then
  if [[ "$mode" == "merged" && "$issue_state" != "CLOSED" ]]; then
    die 3 "merged mode requires a CLOSED issue before status:done sync. Issue #$issue is $issue_state."
  fi
  if [[ "$mode" == "handoff" && "$issue_state" != "OPEN" ]]; then
    die 3 "handoff mode requires an OPEN issue. Issue #$issue is $issue_state."
  fi
fi

worktree_abs=""
main_worktree=""
worktree_branch=""
worktree_dirty="unknown"
unpushed_commits="unknown"
commit_units=""

if [[ -n "$worktree" ]]; then
  [[ -d "$worktree" ]] || die 1 "Worktree path does not exist: $worktree"
  worktree_abs="$(cd "$worktree" && pwd -P)"
  main_worktree="$(git -C "$repo_root" worktree list --porcelain | awk 'NR == 1 { print $2 }')"

  if ! git -C "$repo_root" worktree list --porcelain | awk '/^worktree / { print substr($0, 10) }' | grep -Fxq "$worktree_abs"; then
    die 1 "Path is not registered as a git worktree: $worktree_abs"
  fi

  worktree_branch="$(
    git -C "$repo_root" worktree list --porcelain |
      awk -v target="$worktree_abs" '
        /^worktree / { current = substr($0, 10) }
        current == target && /^branch / { print substr($0, 8) }
      '
  )"
  worktree_branch="${worktree_branch#refs/heads/}"

  if [[ "$workspace_decision" == "remove" && "$worktree_abs" == "$main_worktree" ]]; then
    die 3 "Refusing to remove main worktree: $worktree_abs"
  fi

  if [[ -n "$(git -C "$worktree_abs" status --porcelain)" ]]; then
    worktree_dirty="yes"
  else
    worktree_dirty="no"
  fi

  upstream="$(git -C "$worktree_abs" rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || true)"
  if [[ -n "$upstream" ]]; then
    unpushed_commits="$(git -C "$worktree_abs" rev-list --count "${upstream}..HEAD")"
    commit_units="$(git -C "$worktree_abs" log --oneline "${upstream}..HEAD" || true)"
  else
    unpushed_commits="unknown"
    commit_units="$(git -C "$worktree_abs" log --oneline -5 || true)"
  fi

  if [[ "$workspace_decision" == "remove" && "$worktree_dirty" == "yes" && "$force" != "1" ]]; then
    die 3 "Workspace has uncommitted changes. Use --workspace keep, --workspace pending, or explicit --force."
  fi

  if [[ "$workspace_decision" == "remove" && "$unpushed_commits" != "0" && "$force" != "1" ]]; then
    die 3 "Workspace has unpushed commits: $unpushed_commits. Use --workspace keep, --workspace pending, or explicit --force."
  fi
fi

target_status=""
case "$mode" in
  handoff) target_status="status:review" ;;
  merged) target_status="status:done" ;;
  workspace-cleanup) target_status="" ;;
esac

receipt_body="$(
  cat <<RECEIPT
## Task Close Receipt

- Mode: $mode
- Issue: ${issue:+#$issue }${issue_url}
- PR: ${pr:+#$pr }${pr_url}
- Branch: ${pr_branch:-${worktree_branch:-unknown}}
- Head SHA: ${pr_head_sha:-$head_sha}
- Delivered scope: see linked PR and issue scope
- Completed atomic commit units:
${commit_units:-  - Not available from current worktree state}
- Verification: see linked PR verification section
- Follow-ups or risk-resolution note: none recorded by this closeout gate
- Workspace decision: $workspace_decision
- Worktree: ${worktree_abs:-not provided}
RECEIPT
)"

if [[ "$json" == "1" ]]; then
  printf '{'
  printf '"mode":"%s",' "$(json_escape "$mode")"
  printf '"issue":"%s",' "$(json_escape "$issue")"
  printf '"pr":"%s",' "$(json_escape "$pr")"
  printf '"workspaceDecision":"%s",' "$(json_escape "$workspace_decision")"
  printf '"worktree":"%s",' "$(json_escape "$worktree_abs")"
  printf '"targetStatus":"%s",' "$(json_escape "$target_status")"
  printf '"dryRun":%s' "$([[ "$dry_run" == "1" ]] && printf true || printf false)"
  printf '}\n'
else
  if [[ "$dry_run" == "1" ]]; then
    printf 'task-close dry run passed\n'
  else
    printf 'task-close gate passed\n'
  fi
  printf 'mode: %s\n' "$mode"
  printf 'issue: %s\n' "${issue:-not provided}"
  printf 'pr: %s\n' "${pr:-not provided}"
  printf 'workspace-decision: %s\n' "$workspace_decision"
  printf 'target-status: %s\n' "${target_status:-unchanged}"
  printf 'worktree: %s\n' "${worktree_abs:-not provided}"

  if [[ "$verbose" == "1" ]]; then
    printf 'issue-state: %s\n' "${issue_state:-unknown}"
    printf 'pr-state: %s\n' "${pr_state:-unknown}"
    printf 'worktree-dirty: %s\n' "$worktree_dirty"
    printf 'unpushed-commits: %s\n' "$unpushed_commits"
    printf '\nReceipt preview:\n%s\n' "$receipt_body"
  fi
fi

if [[ "$dry_run" == "1" ]]; then
  exit 0
fi

if [[ -n "$issue" ]]; then
  gh issue comment "$issue" --body "$receipt_body" >/dev/null

  if [[ -n "$target_status" ]] && ! contains_status_label "$target_status"; then
    remove_args=()
    label=""
    for label in "${issue_labels[@]}"; do
      if [[ "$label" == status:* ]]; then
        remove_args+=(--remove-label "$label")
      fi
    done
    gh issue edit "$issue" "${remove_args[@]}" --add-label "$target_status" >/dev/null
  fi
fi

if [[ "$workspace_decision" == "remove" ]]; then
  [[ -n "$worktree_abs" ]] || die 2 "--workspace remove requires --worktree"
  remove_args=(--path "$worktree_abs" --yes)
  if [[ "$force" == "1" ]]; then
    remove_args+=(--force)
  fi
  "$script_dir/worktree-remove.sh" "${remove_args[@]}"
fi
