#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  read-comments.sh [--file-key <key> | --branch-key <key>] [--token-env <env-name>] [--as-md] [--all-branches]

Reads Figma file comments with the REST API:
  GET https://api.figma.com/v1/files/:key/comments

Defaults:
  file key env: FIGMA_VERTICAL_SLICE_V1_FILE_KEY
  token env:    FIGMA_ACCESS_TOKEN

Required token scope:
  file_comments:read
  file_content:read is also required when using --all-branches

Examples:
  set -a; source .env.local; set +a
  .codex/skills/figma-comments-rest/scripts/read-comments.sh --as-md

  FIGMA_ACCESS_TOKEN=... FIGMA_VERTICAL_SLICE_V1_FILE_KEY=... \
    .codex/skills/figma-comments-rest/scripts/read-comments.sh

  .codex/skills/figma-comments-rest/scripts/read-comments.sh \
    --branch-key "$FIGMA_BRANCH_KEY" \
    --as-md

  .codex/skills/figma-comments-rest/scripts/read-comments.sh \
    --all-branches \
    --as-md
USAGE
}

file_key="${FIGMA_VERTICAL_SLICE_V1_FILE_KEY:-}"
token_env="FIGMA_ACCESS_TOKEN"
as_md="0"
all_branches="0"

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --file-key|--branch-key)
      if [[ "$#" -lt 2 || -z "${2:-}" ]]; then
        echo "$1 requires a value" >&2
        exit 2
      fi
      file_key="$2"
      shift 2
      ;;
    --token-env)
      if [[ "$#" -lt 2 || -z "${2:-}" ]]; then
        echo "--token-env requires a value" >&2
        exit 2
      fi
      token_env="$2"
      shift 2
      ;;
    --as-md)
      as_md="1"
      shift
      ;;
    --all-branches)
      all_branches="1"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -z "$file_key" ]]; then
  echo "FIGMA_VERTICAL_SLICE_V1_FILE_KEY is not set; pass --file-key/--branch-key or load .env.local" >&2
  exit 2
fi

token="${!token_env:-}"
if [[ -z "$token" ]]; then
  echo "$token_env is not set; load .env.local or pass --token-env <env-name>" >&2
  exit 2
fi

tmp_dir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

figma_get() {
  local url="$1"
  local output="$2"

  curl --silent --show-error --location \
    --header "X-Figma-Token: ${token}" \
    --output "$output" \
    --write-out "%{http_code}" \
    "$url"
}

comments_url_for_key() {
  local key="$1"
  local base_url="https://api.figma.com/v1/files/${key}/comments"

  if [[ "$as_md" == "1" ]]; then
    printf "%s?as_md=true" "$base_url"
  else
    printf "%s" "$base_url"
  fi
}

fail_for_status() {
  local status="$1"
  local context="$2"
  echo >&2
  echo "Figma request failed with HTTP $status while $context" >&2
  if [[ "$status" == "403" ]]; then
    if [[ "$context" == "discovering branches" ]]; then
      echo "Check token validity, file access, and file_content:read scope." >&2
    else
      echo "Check token validity, file access, and file_comments:read scope." >&2
    fi
  fi
  exit 1
}

if [[ "$all_branches" != "1" ]]; then
  tmp_body="$tmp_dir/comments.json"
  status="$(figma_get "$(comments_url_for_key "$file_key")" "$tmp_body")"
  cat "$tmp_body"

  if [[ "$status" -lt 200 || "$status" -ge 300 ]]; then
    fail_for_status "$status" "reading comments"
  fi
fi

if [[ "$all_branches" == "1" ]]; then
  meta_body="$tmp_dir/file.json"
  targets_body="$tmp_dir/targets.json"
  comments_dir="$tmp_dir/comments"
  mkdir -p "$comments_dir"

  status="$(figma_get "https://api.figma.com/v1/files/${file_key}?branch_data=true&depth=1" "$meta_body")"
  if [[ "$status" -lt 200 || "$status" -ge 300 ]]; then
    cat "$meta_body"
    fail_for_status "$status" "discovering branches"
  fi

  node - "$meta_body" "$file_key" > "$targets_body" <<'NODE'
const fs = require("fs");

const [metaPath, mainKey] = process.argv.slice(2);
const metadata = JSON.parse(fs.readFileSync(metaPath, "utf8"));
const branches = Array.isArray(metadata.branches) ? metadata.branches : [];
const targets = [
  {
    key: mainKey,
    type: "main",
    name: metadata.name || null,
  },
  ...branches.map((branch) => ({
    key: branch.key,
    type: "branch",
    name: branch.name || null,
    last_modified: branch.last_modified || null,
  })),
].filter((target) => Boolean(target.key));

process.stdout.write(JSON.stringify(targets));
NODE

  target_count="$(node -e 'const fs=require("fs"); console.log(JSON.parse(fs.readFileSync(process.argv[1],"utf8")).length)' "$targets_body")"
  for index in $(seq 0 "$((target_count - 1))"); do
    target_key="$(node -e 'const fs=require("fs"); const targets=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); console.log(targets[Number(process.argv[2])].key)' "$targets_body" "$index")"
    comments_body="$comments_dir/$index.json"
    status="$(figma_get "$(comments_url_for_key "$target_key")" "$comments_body")"
    if [[ "$status" -lt 200 || "$status" -ge 300 ]]; then
      cat "$comments_body"
      fail_for_status "$status" "reading comments"
    fi
  done

  node - "$targets_body" "$comments_dir" <<'NODE'
const fs = require("fs");
const path = require("path");

const [targetsPath, commentsDir] = process.argv.slice(2);
const targets = JSON.parse(fs.readFileSync(targetsPath, "utf8"));
const results = targets.map((target, index) => {
  const response = JSON.parse(fs.readFileSync(path.join(commentsDir, `${index}.json`), "utf8"));
  const comments = Array.isArray(response.comments) ? response.comments : [];
  return {
    ...target,
    comments,
    comments_count: comments.length,
  };
});

process.stdout.write(JSON.stringify({
  summary: {
    targets_count: results.length,
    comments_count: results.reduce((sum, result) => sum + result.comments_count, 0),
  },
  targets: results,
}, null, 2));
NODE
fi
