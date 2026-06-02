# Issue System Contract

This contract defines how work enters this repository.

It is the first operating contract under #18. Later leaves extend this file with
relationship tracking, label taxonomy, and GitHub issue templates.

## Lifecycle

Every non-trivial repository change moves through this lifecycle:

```text
Context Build
-> Issue First
-> Issue Intake
-> Implementation
-> PR
-> Slice Review
-> Risk Resolution / System Upgrade
-> Next Issue
```

### 1. Context Build

Context build happens before an issue is created.

The goal is to understand the problem well enough to create a bounded issue.

Minimum context:

- who is affected
- current behavior or current gap
- desired behavior or desired capability
- why the work matters now
- known constraints
- likely scope
- likely non-scope
- observable completion signal

Context build may happen in conversation, local notes, or issue comments. It is
not implementation work.

### 2. Issue First

Every implementation, documentation, workflow, or operations change needs an issue
before work begins.

The issue is the source of truth for:

- problem statement
- goal
- scope
- non-scope
- dependencies
- acceptance criteria
- completion signal

Small command-only checks and read-only investigation do not require a new issue.
Any change that will be committed does.

### 3. Issue Intake

Issue intake is the gate between issue creation and implementation.

An issue passes intake when it has:

- a title following the title convention
- a clear parent or relationship note when relevant
- enough current-state context to avoid guessing
- a bounded scope
- explicit non-scope
- pass/fail acceptance criteria
- dependency notes when ordering matters
- a clear completion signal

Implementation must not begin before issue intake passes.

If intake fails, fix the issue body or split the issue before editing repository
files.

### 4. Implementation

Implementation follows the issue boundary.

Implementation work should:

- stay inside the issue scope
- avoid completing future leaf work early
- preserve unrelated user changes
- update the issue or umbrella tracking surface when the plan changes

### 5. PR

The pull request must connect the code or document change back to the issue.

Minimum PR expectations:

- reference the source issue
- summarize what changed
- summarize verification
- call out any accepted non-scope or follow-up work

If the PR fully completes the issue, it should use the repository's closeout
wording once that convention is defined.

### 6. Slice Review

After a slice or leaf completes, review both the delivered artifact and the
engineering system exposed by the work.

Ask:

- What friction slowed this work down?
- Which friction will likely repeat?
- Which risk became clearer during the work?
- Is a system upgrade issue needed before the next slice?

### 7. Risk Resolution / System Upgrade

Create a risk-resolution or system-upgrade issue when a repeated bottleneck would
make future slices slower, riskier, or less traceable.

Examples:

- missing template
- unclear ownership boundary
- weak test surface
- unstable quality gate
- missing routing documentation
- unclear dependency tracking

Only promote the highest-leverage bottleneck. Do not convert every annoyance into
immediate process work.

### 8. Next Issue

The next issue should use what was learned from the previous slice.

If a system upgrade was created, execute it before continuing product work when
the risk would affect the next slice.

## Title Convention

Issue titles use this format:

```text
<type>: <action-oriented summary>
```

The title summary should prefer Korean because the primary repository operator is
a Korean reader. Keep the type prefix in English so GitHub search, automation,
and future label mapping remain simple.

Examples:

- `chore: 이슈 lifecycle 과 intake contract 정의`
- `docs: 콘텐츠 원천 저장소 결정 문서화`
- `feat: 마크다운 게시글 목록 렌더링`
- `test: 홈 화면 e2e coverage 추가`
- `fix: 게시글 metadata 누락 처리`

Rules:

- Use lowercase type.
- Prefer a Korean action-oriented summary.
- Keep the summary specific enough to distinguish the issue from related work.
- Use English only when it is a stable technical token, API name, file path, or
  command.
- Avoid vague titles such as `문서 수정`, `버그 수정`, or `workflow 개선`.

The allowed title types for this contract are:

| Type       | Meaning                                                  |
| ---------- | -------------------------------------------------------- |
| `feat`     | User-visible product capability                          |
| `fix`      | Defect correction                                        |
| `docs`     | Documentation-only change                                |
| `test`     | Test-only or test-surface change                         |
| `chore`    | Repository operations, workflow, tooling, or maintenance |
| `refactor` | Structural change without intended behavior change       |
| `design`   | Visual or interaction design work                        |
| `infra`    | Deployment, CI, hosting, or environment work             |

## Issue Types

The issue type is implied by the title prefix until the label taxonomy is defined.

### Umbrella Issue

An umbrella issue owns a multi-leaf outcome.

It tracks:

- why the group exists
- sequence
- shared context
- cross-leaf decisions
- closeout status

Deep umbrella and sub-issue rules are defined by the relationship tracking leaf.

### Leaf Issue

A leaf issue owns one bounded implementation outcome.

It should be completable without deciding unrelated future work.

Leaf issues must include:

- parent or relationship note when relevant
- scope
- non-scope
- dependencies
- acceptance criteria
- completion signal

### Risk-Resolution Issue

A risk-resolution issue removes or reduces a bottleneck found during slice review.

It should name:

- the exposed risk
- the impact if ignored
- the system upgrade target
- the expected future benefit

### Decision Issue

A decision issue records a choice before implementation.

It should name:

- decision to make
- options considered
- recommendation
- tradeoffs
- downstream effects

## Issue Relationships

Issue relationships keep work traceable across slices.

Use relationships when one issue is not enough to represent ownership,
sequencing, or shared context.

### Umbrella Ownership

An umbrella issue owns the shared control plane for a multi-leaf outcome.

The umbrella is responsible for:

- why the work group exists
- the ordered leaf sequence
- cross-leaf context
- phase tracking
- shared decisions
- downstream handoff notes
- closeout status

An umbrella should stay open while active leaf work remains.

Do not duplicate downstream context into every leaf. Put shared context on the
umbrella tracking surface, then let leaves reference the umbrella.

### Leaf Ownership

A leaf issue owns one bounded outcome.

The leaf is responsible for:

- one implementation or documentation result
- its own scope and non-scope
- its own acceptance criteria
- its direct dependencies
- its PR and verification result

A leaf should not decide future leaf semantics unless the umbrella explicitly
delegates that decision.

### Sub-Issue Registration

Register an issue as a sub-issue when it is a required child of an umbrella.

Use a sub-issue when:

- the parent owns sequencing
- the child owns a bounded deliverable
- closing the child should advance the parent progress
- the child depends on shared parent context

Do not use a sub-issue when:

- issues are only loosely related
- the child can be completed independently
- the relationship is informational only

When GitHub sub-issues are available, attach the child to the umbrella. If the UI
or API is unavailable, record the relationship in both issue bodies or comments.

Preferred notation:

```text
Parent: #18
Sub-issue of: #18
```

### Related Issues

Use `Related:` when issues share context but do not block each other.

Examples:

```text
Related: #1
Related: #2 because vertical slices use this operating contract.
```

Related issues do not imply execution order.

### Dependency Notation

Use dependency notation when order matters.

Preferred terms:

| Term             | Meaning                                            |
| ---------------- | -------------------------------------------------- |
| `Depends on: #N` | This issue should not finish before `#N` finishes. |
| `Blocked by: #N` | This issue cannot proceed until `#N` is resolved.  |
| `Blocks: #N`     | This issue must finish before `#N` can proceed.    |

Use `Depends on` for planned sequencing. Use `Blocked by` only when work is
actually stuck.

Examples:

```text
Depends on: #19
Blocked by: #21 label taxonomy decision
Blocks: #22 issue template implementation
```

When a dependency changes during execution, update the issue comment or umbrella
tracking surface. Do not leave stale dependency notes in the issue body without a
newer comment explaining the change.

### Umbrella Tracking Comment

An umbrella tracking comment should be the current execution surface.

Use it to track:

- leaf order
- leaf status
- summary
- bounded scope
- non-scope
- acceptance criteria summary
- dependency changes
- closeout actions

Preferred shape:

```md
## #<umbrella> Leaf Sequence

### 운영 원칙

- 구현은 leaf issue 단위로 순차 진행.
- cross-leaf context와 진행 순서는 umbrella tracking surface에 남김.

### Leaf 순서

- [ ] Leaf 1: `<title>`
  - Summary: ...
  - Bounded: ...
  - Not bounded: ...
  - AC: ...

### Closeout Action

- [ ] ...
```

The tracking comment may be edited or superseded by a newer comment. If it is
superseded, the newer comment should clearly say so.

## Label Taxonomy

Labels make issue intake scannable.

Use a small fixed taxonomy. Avoid creating one-off labels for temporary wording.

### Label Axes

Every intake-ready issue should have labels from these axes:

| Axis         | Required | Purpose                              |
| ------------ | -------- | ------------------------------------ |
| `type:*`     | Yes      | What kind of work this is.           |
| `status:*`   | Yes      | Where the issue is in the lifecycle. |
| `priority:*` | Yes      | How soon the work should happen.     |
| `source:*`   | Yes      | Where the work came from.            |
| `area:*`     | Yes      | Which repo surface owns the work.    |

Use one label per axis unless the axis explicitly allows more.

### Type Labels

Type labels classify the work.

Required: exactly one.

| Label           | Meaning                                                  |
| --------------- | -------------------------------------------------------- |
| `type:feat`     | User-visible product capability                          |
| `type:fix`      | Defect correction                                        |
| `type:docs`     | Documentation-only change                                |
| `type:test`     | Test-only or test-surface change                         |
| `type:chore`    | Repository operations, workflow, tooling, or maintenance |
| `type:refactor` | Structural change without intended behavior change       |
| `type:design`   | Visual or interaction design work                        |
| `type:infra`    | Deployment, CI, hosting, or environment work             |

The type label should match the issue title prefix.

### Status Labels

Status labels represent lifecycle state.

Required: exactly one active status.

| Label                | Meaning                                                 |
| -------------------- | ------------------------------------------------------- |
| `status:idea`        | Context is still forming. Not ready for implementation. |
| `status:intake`      | Issue exists and is being shaped.                       |
| `status:ready`       | Intake passed. Implementation may start.                |
| `status:in-progress` | Work is actively being implemented.                     |
| `status:blocked`     | Work cannot proceed until a dependency changes.         |
| `status:review`      | PR or review is active.                                 |
| `status:done`        | Work is complete and merged or otherwise closed out.    |

Status transition:

```text
status:idea
-> status:intake
-> status:ready
-> status:in-progress
-> status:review
-> status:done
```

Use `status:blocked` only while actual progress is blocked. When unblocked, move
back to the previous active status or the next valid status.

### Priority Labels

Priority labels represent execution urgency.

Required: exactly one.

| Label         | Meaning                                                                |
| ------------- | ---------------------------------------------------------------------- |
| `priority:p0` | Must happen immediately to unblock the repo or prevent incorrect work. |
| `priority:p1` | Should happen before the next major slice.                             |
| `priority:p2` | Normal planned work.                                                   |
| `priority:p3` | Useful but not currently sequencing-critical.                          |

Assign priority by impact on the next slice, not by how interesting the work is.

### Source Labels

Source labels record why the issue entered the backlog.

Required: exactly one.

| Label                    | Meaning                                              |
| ------------------------ | ---------------------------------------------------- |
| `source:user-request`    | Direct user request.                                 |
| `source:slice-review`    | Found during slice review.                           |
| `source:risk-resolution` | Created to reduce a known engineering risk.          |
| `source:follow-up`       | Created as downstream work from another issue or PR. |
| `source:maintenance`     | Routine upkeep or cleanup.                           |

### Area Labels

Area labels identify the repo surface.

Required: one or more when work spans surfaces.

| Label         | Meaning                                                          |
| ------------- | ---------------------------------------------------------------- |
| `area:app`    | Next.js app routes or app-level behavior                         |
| `area:shared` | Shared source modules or components                              |
| `area:docs`   | Documentation                                                    |
| `area:ops`    | Repo operating system, issue workflow, AGENTS.md, README routing |
| `area:test`   | Unit, component, or e2e test surface                             |
| `area:ci`     | GitHub Actions or quality gate                                   |
| `area:design` | Visual design, interaction design, or design system              |

### Informational vs State-Bearing

State-bearing labels:

- `status:*`

Informational labels:

- `type:*`
- `priority:*`
- `source:*`
- `area:*`

Only `status:*` should change frequently during execution. Other labels should
usually be stable after intake.

### Required Labels At Intake

An issue passes label intake when it has:

- one `type:*`
- one `status:*`
- one `priority:*`
- one `source:*`
- at least one `area:*`

If labels do not exist yet in GitHub, record the intended labels in the issue body
or intake comment:

```text
Intended labels:
- type:chore
- status:ready
- priority:p1
- source:risk-resolution
- area:ops
- area:docs
```

Actual GitHub label creation and migration may happen in a later operations task.

## Body Quality Requirements

An issue body is intake-ready when an unfamiliar implementer can execute it without
asking for the basic boundary.

Issue bodies should prefer Korean for user-facing context, decisions, scope,
non-scope, and acceptance criteria. English is acceptable for code symbols, file
paths, commands, API names, package names, and copied tool output.

Required sections for implementation issues:

- `Context`
- `Goal`
- `Scope`
- `Non-Scope`
- `Dependencies`
- `Acceptance Criteria`
- `Completion Signal`

Recommended sections when relevant:

- `Current State`
- `Proposed Change`
- `Files Reference`
- `Testing Plan`
- `Rollback Plan`
- `Related`

Body quality rules:

- State the problem before the solution.
- Prefer Korean for prose so the issue remains reviewable by the repo owner.
- Name what is explicitly out of scope.
- Use concrete nouns instead of broad labels.
- Keep downstream context on the umbrella when multiple leaves need it.
- Do not hide required decisions inside implementation notes.
- Do not use acceptance criteria that depend on taste or vibes.

## Acceptance Criteria Quality

Acceptance criteria must be pass/fail.

Good:

- `docs/operations/issue-system.md` defines the full issue lifecycle.
- The issue body states explicit non-scope.
- The PR links back to the source issue.

Bad:

- The workflow is better.
- Docs are clear.
- The feature works.

Acceptance criteria should verify the requested outcome, not every incidental
implementation detail.

## Intake Checklist

Before implementation starts, verify:

- [ ] The issue title follows `<type>: <action-oriented summary>`.
- [ ] The issue has a clear goal.
- [ ] The issue has bounded scope.
- [ ] The issue has explicit non-scope.
- [ ] The issue has pass/fail acceptance criteria.
- [ ] The issue names dependencies when ordering matters.
- [ ] The issue names a completion signal.
- [ ] The issue does not require decisions that belong to a future leaf.

If any item fails, update or split the issue before editing repository files.

## Boundaries

This contract intentionally does not define:

- GitHub issue template shape
- PR body convention

Those are owned by later #18 leaves.
