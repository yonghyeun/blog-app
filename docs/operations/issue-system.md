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

Examples:

- `chore: define issue lifecycle and intake contract`
- `docs: document content source of truth`
- `feat: render markdown post list`
- `test: add e2e coverage for home page`
- `fix: handle missing post metadata`

Rules:

- Use lowercase type.
- Use an imperative or action-oriented summary.
- Keep the summary specific enough to distinguish the issue from related work.
- Avoid vague titles such as `update docs`, `fix bug`, or `improve workflow`.

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

## Body Quality Requirements

An issue body is intake-ready when an unfamiliar implementer can execute it without
asking for the basic boundary.

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

- final label taxonomy
- GitHub issue template shape
- exact sub-issue registration procedure
- exact related/dependency notation
- PR body convention

Those are owned by later #18 leaves.
