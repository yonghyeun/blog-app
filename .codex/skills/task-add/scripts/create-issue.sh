#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  create-issue.sh --kind <umbrella|leaf|standalone> --title <title> --body-file <path> --label <label>... [options]

Options:
  --parent <#number>              Required for --kind leaf. Disallowed otherwise.
  --parent-comment-file <path>    Comment on the parent after creation. Supports {{issue_number}} and {{issue_url}}.
  --dry-run                       Validate inputs and parent state without remote mutation.
  -h, --help                      Show this help.

Side effects:
  - Creates one GitHub issue unless --dry-run is set.
  - Registers leaf issues as GitHub sub-issues of --parent.
  - Adds a parent comment when --parent-comment-file is provided.
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
    die 2 "Invalid parent issue: $1. Pass --parent #<number> or an issue URL."
  fi

  printf '%s\n' "$raw"
}

validate_parent() {
  local parent_issue="$1"
  local state labels

  if ! state="$(gh api "repos/:owner/:repo/issues/${parent_issue}" --jq '.state')"; then
    die 1 "Parent issue #${parent_issue} could not be fetched. Check GitHub auth and repository access."
  fi

  if [[ "$state" != "open" ]]; then
    die 3 "Parent issue #${parent_issue} is not open. Choose an open kind:umbrella parent before creating a leaf."
  fi

  if ! labels="$(gh api "repos/:owner/:repo/issues/${parent_issue}" --jq '.labels[].name')"; then
    die 1 "Parent issue #${parent_issue} labels could not be fetched. Check GitHub API access."
  fi

  if ! grep -qx 'kind:umbrella' <<<"$labels"; then
    die 3 "Parent issue #${parent_issue} is not labeled kind:umbrella. Choose a valid umbrella parent."
  fi
}

validate_labels() {
  local kind="$1"
  local title="$2"
  shift 2
  local labels=("$@")

  local allowed_types=(type:feat type:fix type:docs type:test type:chore type:refactor type:design type:infra)
  local allowed_kinds=(kind:umbrella kind:leaf kind:standalone kind:risk-resolution kind:decision kind:spike)
  local allowed_statuses=(status:idea status:intake status:ready status:in-progress status:blocked status:review status:done)
  local allowed_priorities=(priority:p0 priority:p1 priority:p2 priority:p3)
  local allowed_areas=(area:app area:shared area:docs area:ops area:test area:ci area:design)

  local type_count=0 kind_count=0 status_count=0 priority_count=0 area_count=0
  local type_label="" kind_label="" status_label="" priority_label="" label

  if [[ "${#labels[@]}" -eq 0 ]]; then
    die 2 "Missing labels. Pass --label for type, kind, status, priority, and area axes."
  fi

  for label in "${labels[@]}"; do
    case "$label" in
      type:*)
        contains "$label" "${allowed_types[@]}" || die 3 "Unsupported type label: $label. Use the issue-system type taxonomy."
        type_count=$((type_count + 1))
        type_label="$label"
        ;;
      kind:*)
        contains "$label" "${allowed_kinds[@]}" || die 3 "Unsupported kind label: $label. Use the issue-system kind taxonomy."
        kind_count=$((kind_count + 1))
        kind_label="$label"
        ;;
      status:*)
        contains "$label" "${allowed_statuses[@]}" || die 3 "Unsupported status label: $label. Use the issue-system status taxonomy."
        status_count=$((status_count + 1))
        status_label="$label"
        ;;
      priority:*)
        contains "$label" "${allowed_priorities[@]}" || die 3 "Unsupported priority label: $label. Use the issue-system priority taxonomy."
        priority_count=$((priority_count + 1))
        priority_label="$label"
        ;;
      area:*)
        contains "$label" "${allowed_areas[@]}" || die 3 "Unsupported area label: $label. Use the issue-system area taxonomy."
        area_count=$((area_count + 1))
        ;;
      *)
        die 3 "Unsupported label: $label. Use only issue-system axis labels for task-add."
        ;;
    esac
  done

  [[ "$type_count" -eq 1 ]] || die 3 "Expected exactly one type:* label. Pass one type label that matches the title prefix."
  [[ "$kind_count" -eq 1 ]] || die 3 "Expected exactly one kind:* label. Pass one kind label that matches --kind."
  [[ "$status_count" -eq 1 ]] || die 3 "Expected exactly one status:* label. Pass status:intake for new task-add issues."
  [[ "$priority_count" -eq 1 ]] || die 3 "Expected exactly one priority:* label. Pass one priority label."
  [[ "$area_count" -ge 1 ]] || die 3 "Expected at least one area:* label. Pass one or more area labels."

  if [[ "$kind_label" != "kind:${kind}" ]]; then
    die 3 "Kind label $kind_label does not match --kind $kind. Align --kind and kind:* before creating the issue."
  fi

  if [[ "$status_label" != "status:intake" ]]; then
    die 3 "New task-add issues must start with status:intake. Replace $status_label before creating the issue."
  fi

  if [[ ! "$title" =~ ^[a-z]+: ]]; then
    die 3 "Issue title is missing a lowercase type prefix. Use '<type>: <summary>'."
  fi

  local title_type="${title%%:*}"
  if [[ "$type_label" != "type:${title_type}" ]]; then
    die 3 "Type label $type_label does not match title prefix $title_type. Align the title and type:* label."
  fi

  # Keep these assigned values visible to shellcheck-style readers.
  : "$priority_label"
}

kind=""
title=""
body_file=""
parent=""
parent_comment_file=""
dry_run="0"
labels=()

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --kind)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --kind. Pass umbrella, leaf, or standalone."
      kind="$2"
      shift 2
      ;;
    --title)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --title. Pass an issue title."
      title="$2"
      shift 2
      ;;
    --body-file)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --body-file. Pass a Markdown issue body file."
      body_file="$2"
      shift 2
      ;;
    --label)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --label. Pass a GitHub label name."
      labels+=("$2")
      shift 2
      ;;
    --parent)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --parent. Pass #<umbrella> for leaf issues."
      parent="$(normalize_issue_number "$2")"
      shift 2
      ;;
    --parent-comment-file)
      [[ -n "${2:-}" ]] || die 2 "Missing value for --parent-comment-file. Pass a Markdown comment file."
      parent_comment_file="$2"
      shift 2
      ;;
    --dry-run)
      dry_run="1"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die 2 "Unknown argument: $1. Run create-issue.sh --help."
      ;;
  esac
done

case "$kind" in
  umbrella|leaf|standalone)
    ;;
  "")
    die 2 "Missing --kind. Pass umbrella, leaf, or standalone."
    ;;
  *)
    die 2 "Unsupported --kind: $kind. Pass umbrella, leaf, or standalone."
    ;;
esac

[[ -n "$title" ]] || die 2 "Missing --title. Pass an issue title."
[[ -n "$body_file" ]] || die 2 "Missing --body-file. Pass a Markdown issue body file."
[[ -f "$body_file" ]] || die 2 "Issue body file not found: $body_file. Create the body file before running task-add."

if [[ -n "$parent_comment_file" && ! -f "$parent_comment_file" ]]; then
  die 2 "Parent comment file not found: $parent_comment_file. Create the comment file or omit --parent-comment-file."
fi

if [[ "$kind" == "leaf" ]]; then
  [[ -n "$parent" ]] || die 2 "Missing --parent for leaf issue. Pass --parent #<umbrella>."
else
  [[ -z "$parent" ]] || die 2 "--parent is only valid for leaf issues. Remove --parent or use --kind leaf."
  [[ -z "$parent_comment_file" ]] || die 2 "--parent-comment-file requires --kind leaf. Remove the comment file or use --kind leaf."
fi

validate_labels "$kind" "$title" "${labels[@]}"

if [[ "$kind" == "leaf" ]]; then
  validate_parent "$parent"
fi

if [[ "$dry_run" == "1" ]]; then
  printf 'task-add dry run passed\n'
  printf 'kind: %s\n' "$kind"
  printf 'title: %s\n' "$title"
  printf 'body-file: %s\n' "$body_file"
  if [[ "$kind" == "leaf" ]]; then
    printf 'parent: #%s\n' "$parent"
    [[ -z "$parent_comment_file" ]] || printf 'parent-comment-file: %s\n' "$parent_comment_file"
  fi
  exit 0
fi

label_args=()
for label in "${labels[@]}"; do
  label_args+=(--label "$label")
done

issue_url="$(gh issue create --title "$title" --body-file "$body_file" "${label_args[@]}")"
issue_number="${issue_url##*/}"

if [[ ! "$issue_number" =~ ^[0-9]+$ ]]; then
  die 1 "GitHub issue was created but the issue number could not be parsed from $issue_url. Check the issue manually."
fi

if [[ "$kind" == "leaf" ]]; then
  if ! issue_id="$(gh api "repos/:owner/:repo/issues/${issue_number}" --jq '.id')"; then
    die 1 "Created issue #${issue_number} id could not be fetched. Register the sub-issue manually after checking GitHub API access."
  fi

  gh api "repos/:owner/:repo/issues/${parent}/sub_issues" -X POST -F "sub_issue_id=${issue_id}" >/dev/null

  if [[ -n "$parent_comment_file" ]]; then
    rendered_comment="$(mktemp)"
    cleanup_comment() {
      rm -f "$rendered_comment"
    }
    trap cleanup_comment EXIT

    sed \
      -e "s|{{issue_number}}|${issue_number}|g" \
      -e "s|{{issue_url}}|${issue_url}|g" \
      "$parent_comment_file" >"$rendered_comment"

    gh issue comment "$parent" --body-file "$rendered_comment" >/dev/null
  fi
fi

printf 'Created issue: %s\n' "$issue_url"
if [[ "$kind" == "leaf" ]]; then
  printf 'Registered sub-issue: #%s -> #%s\n' "$issue_number" "$parent"
fi
