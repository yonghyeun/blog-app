#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
hook_path="$repo_root/.githooks/pre-commit"
tmp_dir="$(mktemp -d)"

cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

git -C "$tmp_dir" init --initial-branch=main >/dev/null
git -C "$tmp_dir" config user.email "test@example.com"
git -C "$tmp_dir" config user.name "Test User"
git -C "$tmp_dir" commit --allow-empty --message "initial" --no-verify >/dev/null

if git -C "$tmp_dir" symbolic-ref --quiet --short HEAD >/dev/null; then
  :
else
  echo "Temporary repository branch setup failed. Check local git version." >&2
  exit 1
fi

main_stdout="$tmp_dir/pre-commit-main.out"
main_stderr="$tmp_dir/pre-commit-main.err"
branch_stdout="$tmp_dir/pre-commit-branch.out"
branch_stderr="$tmp_dir/pre-commit-branch.err"
bypass_stdout="$tmp_dir/pre-commit-bypass.out"
bypass_stderr="$tmp_dir/pre-commit-bypass.err"

if (cd "$tmp_dir" && "$hook_path") >"$main_stdout" 2>"$main_stderr"; then
  echo "Expected pre-commit hook to fail on main. Check .githooks/pre-commit." >&2
  exit 1
fi

if ! grep -q "Direct commits on main are blocked." "$main_stderr"; then
  echo "Expected main failure message was not emitted. Check .githooks/pre-commit." >&2
  exit 1
fi

git -C "$tmp_dir" checkout -b work/test-branch >/dev/null 2>/dev/null

if ! (cd "$tmp_dir" && "$hook_path") >"$branch_stdout" 2>"$branch_stderr"; then
  echo "Expected pre-commit hook to pass on non-main branch. Check .githooks/pre-commit." >&2
  cat "$branch_stderr" >&2
  exit 1
fi

git -C "$tmp_dir" checkout main >/dev/null 2>/dev/null

if ! (cd "$tmp_dir" && BYPASS_MAIN_COMMIT_GUARD=1 "$hook_path") >"$bypass_stdout" 2>"$bypass_stderr"; then
  echo "Expected bypass to pass on main. Check BYPASS_MAIN_COMMIT_GUARD handling." >&2
  cat "$bypass_stderr" >&2
  exit 1
fi

echo "pre-commit hook checks passed"
