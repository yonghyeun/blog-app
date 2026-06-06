#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
script="$script_dir/read-comments.sh"
tmp_dir="$(mktemp -d)"

cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

fake_bin="$tmp_dir/bin"
curl_log="$tmp_dir/curl.log"
mkdir -p "$fake_bin"

cat >"$fake_bin/curl" <<'FAKE_CURL'
#!/usr/bin/env bash
set -euo pipefail

log_file="${FIGMA_COMMENTS_TEST_CURL_LOG:?}"
output_file=""
status="200"
url=""

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --output)
      output_file="$2"
      shift 2
      ;;
    --write-out)
      shift 2
      ;;
    --header)
      printf 'header=%s\n' "$2" >>"$log_file"
      shift 2
      ;;
    --silent|--show-error|--location)
      shift
      ;;
    *)
      url="$1"
      shift
      ;;
  esac
done

printf 'url=%s\n' "$url" >>"$log_file"

if [[ -z "$output_file" ]]; then
  printf 'missing curl output file\n' >&2
  exit 1
fi

if [[ "${FIGMA_COMMENTS_TEST_HTTP_STATUS:-200}" == "403" ]]; then
  status="403"
  printf '{"err":"forbidden"}\n' >"$output_file"
else
  printf '{"comments":[]}\n' >"$output_file"
fi

printf '%s' "$status"
FAKE_CURL

chmod +x "$fake_bin/curl"

run_script() {
  PATH="$fake_bin:$PATH" FIGMA_COMMENTS_TEST_CURL_LOG="$curl_log" "$script" "$@"
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

expect_failure 'FIGMA_VERTICAL_SLICE_V1_FILE_KEY is not set; pass --file-key or load .env.local' \
  --token-env FIGMA_COMMENTS_TEST_TOKEN

FIGMA_COMMENTS_TEST_TOKEN=token expect_failure 'CUSTOM_TOKEN is not set; load .env.local or pass --token-env <env-name>' \
  --file-key file123 \
  --token-env CUSTOM_TOKEN

FIGMA_COMMENTS_TEST_TOKEN=token run_script \
  --file-key file123 \
  --token-env FIGMA_COMMENTS_TEST_TOKEN \
  --as-md >"$tmp_dir/success.out"

grep -Fq '{"comments":[]}' "$tmp_dir/success.out" || {
  printf 'Expected response body on stdout.\n' >&2
  cat "$tmp_dir/success.out" >&2
  exit 1
}

grep -Fq 'url=https://api.figma.com/v1/files/file123/comments?as_md=true' "$curl_log" || {
  printf 'Expected as_md request URL.\n' >&2
  cat "$curl_log" >&2
  exit 1
}

FIGMA_COMMENTS_TEST_TOKEN=token FIGMA_COMMENTS_TEST_HTTP_STATUS=403 expect_failure \
  'Check token validity, file access, and file_comments:read scope.' \
  --file-key file123 \
  --token-env FIGMA_COMMENTS_TEST_TOKEN

printf 'figma-comments-rest read-comments checks passed\n'
