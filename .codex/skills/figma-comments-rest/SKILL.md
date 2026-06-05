---
name: figma-comments-rest
description: Read Figma file comments through the Figma REST API and move review feedback into the issue or handoff surface without relying on Figma MCP comment support.
---

# Figma Comments REST

## Goal

Collect Figma handoff comments through the Figma REST API with explicit token,
file key, and output handling.

Use this skill when:

- a Figma review or handoff depends on comments
- comments must be copied to a source issue or handoff receipt
- Figma MCP comment behavior is unclear or insufficient

Do not use this skill for Figma writes, comment creation, comment deletion, or
screen generation. Use the Figma MCP workflow for editable Figma design work.

## Required Secret Scope

Use a local Figma REST API token with:

```text
file_comments:read
```

When reading every branch with `--all-branches`, the token also needs:

```text
file_content:read
```

Store the token only in local environment, normally `.env.local`:

```text
FIGMA_ACCESS_TOKEN=
```

Use the existing local file key variable for the vertical slice file:

```text
FIGMA_VERTICAL_SLICE_V1_FILE_KEY=
```

Concrete token values, file keys, branch keys, file URLs, page URLs, frame URLs,
and node URLs must not be committed to this public repository unless the target
Figma file is intentionally public.

## API Contract

The comment read endpoint is:

```text
GET https://api.figma.com/v1/files/:key/comments
```

`:key` may be a file key or branch key.

The script uses:

```text
X-Figma-Token: <token>
```

Pass `--as-md` when markdown-formatted comment text is useful for issue
handoff.

## Workflow

1. Confirm the source issue has passed intake.
2. Load local secrets into the shell without printing them.
3. Read comments through the REST script.
4. Review the JSON locally.
5. Copy only the relevant comment summary, author/thread context, and Figma node
   references to the source issue or handoff receipt.
6. Do not commit the raw response if it contains private file, user, or URL
   details.

Example:

```bash
set -a
source .env.local
set +a

.codex/skills/figma-comments-rest/scripts/read-comments.sh --as-md \
  > /tmp/figma-comments.json
```

For a non-default file key:

```bash
.codex/skills/figma-comments-rest/scripts/read-comments.sh \
  --file-key "$FIGMA_VERTICAL_SLICE_V1_FILE_KEY" \
  --as-md
```

For a branch key:

```bash
.codex/skills/figma-comments-rest/scripts/read-comments.sh \
  --branch-key "$FIGMA_BRANCH_KEY" \
  --as-md
```

To discover every branch from the main file and read comments from each target:

```bash
.codex/skills/figma-comments-rest/scripts/read-comments.sh \
  --all-branches \
  --as-md
```

`--all-branches` changes the output shape from the native Figma
`{"comments":[]}` response to a repo-local aggregate:

```text
{
  "summary": {
    "targets_count": 0,
    "comments_count": 0
  },
  "targets": []
}
```

## Handoff Recording

Record the result on the source issue or handoff surface in this shape:

```text
## Figma Comment Handoff

- Source: Figma file/page/frame/node URL kept on issue or private handoff surface
- Collection path: Figma REST API `GET /v1/files/:key/comments`
- Token scope used: `file_comments:read`
- Comment threads reviewed: <count or thread ids>
- Implementation-relevant feedback:
  - <short summary with author/thread context>
- Non-actionable or deferred feedback:
  - <short summary or none>
```

Keep private file keys and secret values out of committed docs.

## Troubleshooting

If the script fails:

- `FIGMA_ACCESS_TOKEN is not set`: load `.env.local` or pass
  `--token-env <name>`.
- `FIGMA_VERTICAL_SLICE_V1_FILE_KEY is not set`: load `.env.local`, pass
  `--file-key <key>`, or pass `--branch-key <key>`.
- HTTP `403`: check that the token is valid, not expired, can access the file,
  and includes `file_comments:read`. For `--all-branches`, also check
  `file_content:read`.
- HTTP `404`: check that the file key or branch key is correct and visible to
  the token owner.
- Empty comments array: confirm comments exist on the target file or branch, not
  only in a different branch/file.

## Verification

Before using this skill in task work:

```bash
bash -n .codex/skills/figma-comments-rest/scripts/read-comments.sh
.codex/skills/figma-comments-rest/scripts/read-comments.sh --help
```
