# Repo-Local Skill Contract

This contract defines how repo-local Codex skills are authored in this repository.

It applies to skills under:

```text
.codex/skills/<skill-name>/
```

## Purpose

Repo-local skills are executable operating procedures for this repository.

They must be:

- discoverable from `AGENTS.md`
- readable before execution
- bounded to one job
- backed by deterministic scripts only when needed
- testable when scripts are present
- explicit about local or remote side effects

## Directory Contract

Every repo-local skill directory must contain:

```text
.codex/skills/<skill-name>/
├── SKILL.md
└── agents/
    └── openai.yaml
```

Optional resources:

```text
.codex/skills/<skill-name>/
├── scripts/
├── references/
└── assets/
```

Rules:

- `SKILL.md` is required.
- `agents/openai.yaml` is required for repo-local skills.
- `scripts/` is optional. Add it only for deterministic behavior or repeated
  command logic.
- `references/` is optional. Add it only for documents specific to that skill.
- `assets/` is optional. Add it only for templates or files consumed by the
  skill output.
- Do not place generic templates under `.codex/skills/templates`. The
  `.codex/skills` tree is the runtime skill surface.

## Template Location

Skill authoring templates live under:

```text
docs/operations/skill-templates/
```

Current templates:

- [`SKILL.md.template`](./skill-templates/SKILL.md.template)

Templates are documentation and authoring aids. They are not installed skills.

## References Contract

`references/` files are skill-local supporting documents.

Allowed:

- detailed workflow notes that only one skill needs
- API response examples used only by the skill
- command reference specific to the skill
- long examples that would bloat `SKILL.md`

Not allowed:

- copies of repo-wide contracts
- copies of `AGENTS.md`
- duplicated architecture source-of-truth content
- unrelated notes shared by multiple skills

If a skill needs a repo-wide contract, link to the existing file and instruct
the agent when to read it.

## SKILL.md Contract

`SKILL.md` must use YAML frontmatter followed by concise Markdown instructions.

Required frontmatter:

| Field         | Meaning                                                     |
| ------------- | ----------------------------------------------------------- |
| `name`        | Skill id. Lowercase letters, digits, and hyphens only.      |
| `description` | Trigger description. Include when the skill should be used. |

Required body sections:

| Section              | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| `Goal`               | One job the skill performs.                                    |
| `When To Use`        | Explicit and implicit trigger conditions.                      |
| `Inputs / Arguments` | Arguments, defaults, and behavior.                             |
| `Workflow`           | Ordered execution steps.                                       |
| `Commands`           | Script commands, arguments, side effects, and failure actions. |
| `Stop Conditions`    | Conditions that must stop the workflow.                        |
| `Verification`       | Checks that prove the skill worked.                            |
| `References`         | Skill-local references and when to read them.                  |

Keep `SKILL.md` focused on core procedure and routing. Move detailed or
conditional material into `references/`.

Do not remove required headings when a section does not apply to a skill. Keep
the heading and write `관련 사항 없음` or `Not applicable`, plus one short reason
when the absence could affect execution.

## Command Table Schema

Every command documented in `SKILL.md` must include:

| Field                 | Required | Meaning                                                           |
| --------------------- | -------- | ----------------------------------------------------------------- |
| Command               | yes      | Executable command or script path.                                |
| When                  | yes      | When the command should run.                                      |
| Required Args         | yes      | Required flags, positional args, or env vars.                     |
| Optional Args         | yes      | Optional args and defaults. Use `None` when absent.               |
| Preconditions         | yes      | State that must be true before running.                           |
| Side Effects          | yes      | Local files, worktrees, issues, PRs, branches, or network writes. |
| Output                | yes      | Success output or durable artifact.                               |
| Failure / Next Action | yes      | What to do next when the command fails.                           |

Use tables for commands even when a skill has only one command.

If a skill has no script or command, keep the `Commands` heading and write
`관련 사항 없음. 이 skill은 문서화된 절차만 제공한다.`

## Script Contract

Scripts are optional. Add scripts when the behavior should be deterministic or
would otherwise be rewritten repeatedly.

Detailed script authoring rules live in:

- [Repo-Local Skill Script Contract](./repo-local-skill-script-contract.md)

When a skill has scripts:

- keep scripts under `scripts/`
- use a clear shebang for executable scripts
- keep script names action-oriented
- document the script in the `Commands` section of `SKILL.md`
- document local and remote side effects
- include a colocated test unless the script is trivial and the exception is
  documented

Script metadata minimum:

| Field        | Required | Meaning                                      |
| ------------ | -------- | -------------------------------------------- |
| Script Path  | yes      | Path under `scripts/`.                       |
| Test Path    | yes      | Colocated test path or documented exception. |
| Purpose      | yes      | Deterministic behavior the script owns.      |
| Inputs       | yes      | Args, env vars, or stdin.                    |
| Side Effects | yes      | Local or remote mutation.                    |
| Exit Codes   | yes      | Important exit code meanings.                |
| Error Style  | yes      | Whether next-action errors are followed.     |

## Script Test Convention

Script tests must be colocated with the script they test.

Examples:

```text
scripts/worktree-add.sh
scripts/worktree-add.test.sh
```

```text
scripts/update-vscode-workspace.mjs
scripts/update-vscode-workspace.test.mjs
```

Test names must preserve the script basename and add `.test` before the
extension.

## Error Message Convention

Skill scripts must emit next-action error messages.

Pattern:

```text
<problem>. <next action>.
```

Examples:

```text
Missing issue number. Pass --issue <number> or provide an issue URL.
```

```text
Worktree path already exists. Choose --worktree <path> or run task-close first.
```

```text
GitHub API request failed. Re-run with GH_DEBUG=api and check token permissions.
```

Avoid vague messages such as:

```text
Failed.
Invalid input.
Something went wrong.
```

## Follow-Up Boundaries

This contract only defines the authoring standard.

Follow-up leaf work owns:

- validator implementation
- CI quality gate integration
- shell script test implementation for existing scripts
- existing skill migration
- `.codex/skills` to `.agents/skills` location decisions

## Local Validation

Run the local validator with:

```bash
npm run validate:skills
```

The validator checks the minimum repo-local skill structure:

- `SKILL.md`
- `agents/openai.yaml`
- `SKILL.md` frontmatter `name`
- `SKILL.md` frontmatter `description`
- colocated script tests or documented script test exceptions

This validator is intentionally separate from the Quality Gate until the existing
repo-local skills are migrated to the contract. Before that migration is
complete, the command may fail and should be read as a drift report.
