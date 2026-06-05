#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  run.sh --issue <number> [--worktree <path>] [--branch <name>] [options]

Options:
  --issue <number>     Source GitHub issue to intake.
  --worktree <path>    Worktree path to create or reuse.
  --branch <name>      Branch name for the worktree.
  --base <ref>         Start point for new branches. Defaults to origin/main.
  --check-only         Validate intake requirements only. No mutations.
  --dry-run            Print planned mutations. No mutations.
  --fix-issue          Promote status:intake to status:ready when intake passes. Default.
  --no-fix-issue       Fail instead of updating status:intake.
  --no-code-add        Pass --no-code-add to worktree-add.sh.
  -h, --help           Show this help.

Side effects without --check-only or --dry-run:
  - May update issue status from status:intake to status:ready.
  - Creates or reuses a git worktree through worktree-add.sh.
  - Adds an intake receipt comment to the issue.

Environment:
  TASK_INTAKE_WORKTREE_ADD_SH  Override worktree-add.sh path for focused tests.
USAGE
}

die() {
  local code="$1"
  shift
  printf '%s\n' "$*" >&2
  exit "$code"
}

contains() {
  local needle="$1"
  shift
  local item
  for item in "$@"; do
    if [[ "$item" == "$needle" ]]; then
      return 0
    fi
  done
  return 1
}

normalize_issue_number() {
  local raw="$1"
  raw="${raw#\#}"
  raw="${raw##*/issues/}"

  if [[ ! "$raw" =~ ^[0-9]+$ ]]; then
    die 2 "Invalid issue: $1. Pass --issue <number> or an issue URL."
  fi

  printf '%s\n' "$raw"
}

require_body_marker() {
  local body="$1"
  local marker="$2"

  if ! grep -Eiq "^#{1,3}[[:space:]]+${marker}[[:space:]]*$" <<<"$body"; then
    die 3 "GitHub issue is missing ${marker}. Update the issue body before intake."
  fi
}

require_non_empty_section() {
  local body="$1"
  local marker="$2"

  require_body_marker "$body" "$marker"

  if ! awk -v marker="$marker" '
    BEGIN { in_section = 0; found = 0 }
    $0 ~ "^#{1,3}[[:space:]]+" marker "[[:space:]]*$" { in_section = 1; next }
    in_section && $0 ~ "^#{1,3}[[:space:]]+" { in_section = 0 }
    in_section && $0 !~ "^[[:space:]]*$" { found = 1 }
    END { exit found ? 0 : 1 }
  ' <<<"$body"; then
    die 3 "GitHub issue has an empty ${marker} section. Add concrete intake content before implementation."
  fi
}

fetch_issue_field() {
  local issue="$1"
  local jq_expr="$2"

  gh api "repos/:owner/:repo/issues/${issue}" --jq "$jq_expr"
}

validate_parent() {
  local parent_issue="$1"
  local state labels

  if ! state="$(fetch_issue_field "$parent_issue" '.state')"; then
    die 1 "Parent issue #${parent_issue} could not be fetched. Check GitHub auth and repository access."
  fi

  if [[ "$state" != "open" ]]; then
    die 3 "Parent issue #${parent_issue} is not open. Choose an open kind:umbrella parent before intake."
  fi

  if ! labels="$(fetch_issue_field "$parent_issue" '.labels[].name')"; then
    die 1 "Parent issue #${parent_issue} labels could not be fetched. Check GitHub API access."
  fi

  if ! grep -qx 'kind:umbrella' <<<"$labels"; then
    die 3 "Parent issue #${parent_issue} is not labeled kind:umbrella. Choose a valid umbrella parent."
  fi
}

extract_parent_issue() {
  local body="$1"
  local parent_line

  parent_line="$(grep -Eim1 '^Parent:[[:space:]]*#?[0-9]+' <<<"$body" || true)"
  if [[ -z "$parent_line" ]]; then
    die 3 "Leaf issue is missing Parent relationship. Add Parent: #<umbrella> before intake."
  fi

  sed -E 's/^Parent:[[:space:]]*#?([0-9]+).*$/\1/I' <<<"$parent_line"
}

validate_labels() {
  local title="$1"
  shift
  local labels=("$@")

  local allowed_types=(type:feat type:fix type:docs type:test type:chore type:refactor type:design type:infra)
  local allowed_kinds=(kind:leaf kind:standalone)
  local allowed_statuses=(status:intake status:ready status:in-progress)
  local allowed_priorities=(priority:p0 priority:p1 priority:p2 priority:p3)
  local allowed_areas=(area:app area:shared area:docs area:ops area:test area:ci area:design)

  local type_count=0 kind_count=0 status_count=0 priority_count=0 area_count=0
  type_label=""
  kind_label=""
  status_label=""

  local label
  for label in "${labels[@]}"; do
    case "$label" in
      type:*)
        contains "$label" "${allowed_types[@]}" || die 3 "Unsupported type label: $label. Use the issue-system type taxonomy."
        type_count=$((type_count + 1))
        type_label="$label"
        ;;
      kind:*)
        contains "$label" "${allowed_kinds[@]}" || die 3 "Unsupported task-intake kind label: $label. Intake executable leaf or standalone issues only."
        kind_count=$((kind_count + 1))
        kind_label="$label"
        ;;
      status:*)
        contains "$label" "${allowed_statuses[@]}" || die 3 "Unsupported intake status label: $label. Use status:intake, status:ready, or status:in-progress."
        status_count=$((status_count + 1))
        status_label="$label"
        ;;
      priority:*)
        contains "$label" "${allowed_priorities[@]}" || die 3 "Unsupported priority label: $label. Use the issue-system priority taxonomy."
        priority_count=$((priority_count + 1))
        ;;
      area:*)
        contains "$label" "${allowed_areas[@]}" || die 3 "Unsupported area label: $label. Use the issue-system area taxonomy."
        area_count=$((area_count + 1))
        ;;
    esac
  done

  [[ "$type_count" -eq 1 ]] || die 3 "Expected exactly one type:* label. Align issue labels before intake."
  [[ "$kind_count" -eq 1 ]] || die 3 "Expected exactly one executable kind:* label. Use kind:leaf or kind:standalone."
  [[ "$status_count" -eq 1 ]] || die 3 "Expected exactly one intake status:* label. Use status:intake, status:ready, or status:in-progress."
  [[ "$priority_count" -eq 1 ]] || die 3 "Expected exactly one priority:* label. Add one priority label before intake."
  [[ "$area_count" -ge 1 ]] || die 3 "Expected at least one area:* label. Add one or more area labels before intake."

  if [[ ! "$title" =~ ^[a-z]+: ]]; then
    die 3 "Issue title is missing a lowercase type prefix. Use '<type>: <summary>'."
  fi

  local title_type="${title%%:*}"
  if [[ "$type_label" != "type:${title_type}" ]]; then
    die 3 "Type label $type_label does not match title prefix $title_type. Align the title and type:* label."
  fi
}

ensure_worktree() {
  local worktree="$1"
  local branch="$2"
  local base="$3"
  local no_code_add="$4"
  local worktree_script="$5"

  if [[ -e "$worktree" ]]; then
    if git -C "$worktree" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
      local current_branch
      current_branch="$(git -C "$worktree" rev-parse --abbrev-ref HEAD)"
      if [[ "$current_branch" != "$branch" ]]; then
        die 3 "Existing worktree branch is $current_branch, not $branch. Choose the matching --worktree or --branch."
      fi
      printf 'Using existing worktree: %s\n' "$worktree"
      return 0
    fi

    die 3 "Worktree path already exists and is not a git worktree. Choose another --worktree path."
  fi

  local args=(--path "$worktree" --branch "$branch" --base "$base")
  if [[ "$no_code_add" == "1" ]]; then
    args+=(--no-code-add)
  fi

  "$worktree_script" "${args[@]}"
}

issue=""
worktree=""
branch=""
base="origin/main"
check_only="0"
dry_run="0"
fix_issue="1"
no_code_add="0"

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --issue)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --issue. Pass a GitHub issue number."
      issue="$(normalize_issue_number "$2")"
      shift 2
      ;;
    --worktree)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --worktree. Pass a worktree path."
      worktree="$2"
      shift 2
      ;;
    --branch)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --branch. Pass a branch name."
      branch="$2"
      shift 2
      ;;
    --base)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --base. Pass a git ref."
      base="$2"
      shift 2
      ;;
    --check-only)
      check_only="1"
      shift
      ;;
    --dry-run)
      dry_run="1"
      shift
      ;;
    --fix-issue)
      fix_issue="1"
      shift
      ;;
    --no-fix-issue)
      fix_issue="0"
      shift
      ;;
    --no-code-add)
      no_code_add="1"
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

[[ -n "$issue" ]] || die 2 "Missing --issue. Pass the source issue number."

if [[ "$check_only" == "1" && "$dry_run" == "1" ]]; then
  die 2 "--check-only and --dry-run cannot be combined. Choose one read-only mode."
fi

if [[ "$check_only" == "0" && "$dry_run" == "0" ]]; then
  [[ -n "$worktree" ]] || die 2 "Missing --worktree. Pass the isolated worktree path for implementation."
  [[ -n "$branch" ]] || die 2 "Missing --branch. Pass the implementation branch name."
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
worktree_script="${TASK_INTAKE_WORKTREE_ADD_SH:-$script_dir/worktree-add.sh}"

if [[ ! -x "$worktree_script" ]]; then
  die 1 "Worktree script is not executable: $worktree_script. Restore task-intake scripts before intake."
fi

if ! title="$(fetch_issue_field "$issue" '.title')"; then
  die 1 "Issue #${issue} could not be fetched. Check GitHub auth and repository access."
fi
state="$(fetch_issue_field "$issue" '.state')"
body="$(fetch_issue_field "$issue" '.body // ""')"
mapfile -t labels < <(fetch_issue_field "$issue" '.labels[].name')

if [[ "$state" != "open" ]]; then
  die 3 "Issue #${issue} is not open. Choose an open issue before intake."
fi

validate_labels "$title" "${labels[@]}"

require_non_empty_section "$body" "Scope"
require_non_empty_section "$body" "Non-Scope"
require_non_empty_section "$body" "Acceptance Criteria"
require_non_empty_section "$body" "Completion Signal"

if ! grep -Eiq '^(##[[:space:]]+Relationship|##[[:space:]]+Dependencies|Depends on:|Blocked by:|Related:)' <<<"$body"; then
  die 3 "GitHub issue is missing dependency or relationship notes. Add Relationship or Dependencies before intake."
fi

if [[ "$kind_label" == "kind:leaf" ]]; then
  parent_issue="$(extract_parent_issue "$body")"
  validate_parent "$parent_issue"
  if ! grep -Eiq "^Sub-issue of:[[:space:]]*#?${parent_issue}([[:space:]]|$)" <<<"$body"; then
    die 3 "Leaf issue is missing matching Sub-issue of relationship. Add Sub-issue of: #${parent_issue} before intake."
  fi
fi

if [[ "$status_label" == "status:intake" && "$fix_issue" == "0" && "$check_only" == "0" && "$dry_run" == "0" ]]; then
  die 3 "Issue #${issue} is still status:intake. Re-run with --fix-issue or update it to status:ready before implementation."
fi

printf 'task-intake validation passed\n'
printf 'issue: #%s\n' "$issue"
printf 'title: %s\n' "$title"
printf 'kind: %s\n' "$kind_label"
printf 'status: %s\n' "$status_label"

if [[ "$check_only" == "1" ]]; then
  printf 'mode: check-only\n'
  if [[ "$status_label" == "status:intake" ]]; then
    printf 'status-sync: would promote status:intake to status:ready in mutation mode\n'
  fi
  exit 0
fi

if [[ "$dry_run" == "1" ]]; then
  printf 'mode: dry-run\n'
  printf 'remote mutations:\n'
  if [[ "$status_label" == "status:intake" ]]; then
    if [[ "$fix_issue" == "1" ]]; then
      printf '%s\n' "- update issue #${issue} status:intake -> status:ready"
    else
      printf '%s\n' "- none; --no-fix-issue would fail in mutation mode while status:intake remains"
    fi
  else
    printf '%s\n' "- no status update needed"
  fi
  printf '%s\n' "- add intake receipt comment to issue #${issue}"
  printf 'local mutations:\n'
  printf '%s' "- run ${worktree_script} --path ${worktree:-<required-in-mutation-mode>} --branch ${branch:-<required-in-mutation-mode>} --base ${base}"
  if [[ "$no_code_add" == "1" ]]; then
    printf ' --no-code-add'
  fi
  printf '\n'
  exit 0
fi

if [[ "$status_label" == "status:intake" ]]; then
  gh issue edit "$issue" --remove-label status:intake --add-label status:ready >/dev/null
  printf 'Updated issue #%s status:intake -> status:ready\n' "$issue"
  status_label="status:ready"
fi

ensure_worktree "$worktree" "$branch" "$base" "$no_code_add" "$worktree_script"

receipt_file="$(mktemp)"
cleanup_receipt() {
  rm -f "$receipt_file"
}
trap cleanup_receipt EXIT

cat >"$receipt_file" <<RECEIPT
## Intake Receipt

- Issue: #${issue}
- Branch: ${branch}
- Worktree: ${worktree}
- Intake status: pass
- Accepted scope: see the issue Scope section
- Non-scope: see the issue Non-Scope section
- Planned verification: run the focused checks for this issue, then the relevant README Quality Gate commands before PR
- Status sync: ${status_label}
RECEIPT

comment_url="$(gh issue comment "$issue" --body-file "$receipt_file")"

printf 'Intake receipt: %s\n' "$comment_url"
printf 'task-intake ready for implementation\n'
