#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  read-comments.sh [--file-key <key> | --branch-key <key>] [--token-env <env-name>] [--as-md]

Reads Figma file comments with the REST API:
  GET https://api.figma.com/v1/files/:key/comments

Defaults:
  file key env: FIGMA_VERTICAL_SLICE_V1_FILE_KEY
  token env:    FIGMA_ACCESS_TOKEN

Required token scope:
  file_comments:read

Examples:
  set -a; source .env.local; set +a
  .codex/skills/figma-comments-rest/scripts/read-comments.sh --as-md

  FIGMA_ACCESS_TOKEN=... FIGMA_VERTICAL_SLICE_V1_FILE_KEY=... \
    .codex/skills/figma-comments-rest/scripts/read-comments.sh

  .codex/skills/figma-comments-rest/scripts/read-comments.sh \
    --branch-key "$FIGMA_BRANCH_KEY" \
    --as-md
USAGE
}

file_key="${FIGMA_VERTICAL_SLICE_V1_FILE_KEY:-}"
token_env="FIGMA_ACCESS_TOKEN"
as_md="0"

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

base_url="https://api.figma.com/v1/files/${file_key}/comments"
if [[ "$as_md" == "1" ]]; then
  url="${base_url}?as_md=true"
else
  url="$base_url"
fi

tmp_body="$(mktemp)"
cleanup() {
  rm -f "$tmp_body"
}
trap cleanup EXIT

status="$(
  curl --silent --show-error --location \
    --header "X-Figma-Token: ${token}" \
    --output "$tmp_body" \
    --write-out "%{http_code}" \
    "$url"
)"

cat "$tmp_body"

if [[ "$status" -lt 200 || "$status" -ge 300 ]]; then
  echo >&2
  echo "Figma comments request failed with HTTP $status" >&2
  if [[ "$status" == "403" ]]; then
    echo "Check token validity, file access, and file_comments:read scope." >&2
  fi
  exit 1
fi
