# Document Style Drift Inventory

Issue: #109.

기준 문서:

- [Agent Writing Style](./agent-writing-style.md)
- [Repo-Local Skill Contract](./repo-local-skill-contract.md)
- [Architecture README](../architecture/README.md)

## 상태

- 대상: `.codex/skills/*/SKILL.md`.
- 대상: `.codex/skills/*/agents/openai.yaml`.
- 대상: `docs/architecture/*.md`.
- 목적: `korean-doc-writer` 기준과의 drift 분류.
- 비범위: 계약 의미 변경.
- 비범위: 기존 skill 문서 전체 리라이트.
- 비범위: architecture contract 전체 한국어화.

## 분류 기준

- 표현만 수정 가능: 의미와 실행 절차를 바꾸지 않는 user-facing 문구.
- 구조 수정 필요: heading, section order, command table, 문서 언어 전환처럼 리뷰 범위가 큰 변경.
- 의미/계약 변경 위험: architecture boundary, test ownership, quality gate, secret handling, script behavior가 바뀔 수 있는 변경.

## 표현만 수정 가능

### `.codex/skills/*/agents/openai.yaml`

- drift: `short_description`, `default_prompt`가 모두 영어 중심.
- 영향: agent UI와 prompt entry point의 사용자-facing 문체 불일치.
- 조치: 한국어 우선 단문형으로 정리.
- 리스크: 낮음. Skill id와 display name은 stable token으로 유지.

대상:

- `.codex/skills/figma-comments-rest/agents/openai.yaml`
- `.codex/skills/korean-doc-writer/agents/openai.yaml`
- `.codex/skills/task-add/agents/openai.yaml`
- `.codex/skills/task-close/agents/openai.yaml`
- `.codex/skills/task-intake/agents/openai.yaml`
- `.codex/skills/task-merge/agents/openai.yaml`

## 구조 수정 필요

### `.codex/skills/*/SKILL.md`

- drift: 여러 `SKILL.md`가 영어 중심 절차 문서.
- drift: 일부 skill은 `repo-local-skill-contract.md`의 required body section과 section naming이 다름.
- 판단: 문체만의 문제가 아니라 skill contract migration 문제.
- 조치: 이번 leaf에서 전면 수정하지 않음.
- 후속: 기존 skill migration leaf 필요.

대상:

- `.codex/skills/figma-comments-rest/SKILL.md`
- `.codex/skills/task-add/SKILL.md`
- `.codex/skills/task-close/SKILL.md`
- `.codex/skills/task-intake/SKILL.md`
- `.codex/skills/task-merge/SKILL.md`

예외:

- `.codex/skills/korean-doc-writer/SKILL.md`는 한국어 우선 문체에 이미 가까움.
- command table과 없음 처리 방식은 현재 기준과 대체로 일치.

### `docs/architecture/*.md`

- drift: architecture contract 대부분이 영어 중심.
- drift: 일부 문서가 긴 설명형 paragraph를 포함.
- 판단: 한국어화는 단순 문체 수정이 아니라 계약 리뷰 필요.
- 조치: 이번 leaf에서 전면 수정하지 않음.
- 후속: architecture contract별 한국어 요약 또는 contract rewrite leaf 필요.

대상:

- `docs/architecture/ci-quality-gate.md`
- `docs/architecture/foundation-architecture.md`
- `docs/architecture/frontend-accessibility-guide.md`
- `docs/architecture/playwright-e2e-surface.md`
- `docs/architecture/storybook-ui-surface.md`
- `docs/architecture/tdd-test-surface.md`

## 의미/계약 변경 위험

### Architecture boundary 문구

- 위험: `must`, `should`, `allowed`, `not allowed` 번역 중 강제 수준이 바뀔 수 있음.
- 영향: layer boundary, private content boundary, test surface ownership 변경 가능.
- 조치: 이번 leaf에서 수정하지 않음.
- 후속: 문서별 owner review 필요.

### Quality gate 문구

- 위험: command list나 실행 조건의 번역이 gate 범위를 바꿀 수 있음.
- 영향: PR review 기준 변경 가능.
- 조치: 이번 leaf에서 수정하지 않음.
- 후속: CI/quality gate contract leaf 필요 시 분리.

### Skill script behavior 문구

- 위험: `SKILL.md`의 command, side effect, exit code 설명 변경이 script 사용법을 바꿀 수 있음.
- 영향: task lifecycle automation 오작동 가능.
- 조치: 이번 leaf에서 수정하지 않음.
- 후속: script test와 함께 migration 필요.

### `validate:skills` baseline drift

- 상태: `npm run validate:skills` 실패.
- 원인: 기존 script의 colocated test 또는 예외 문서 누락.
- 판단: 이번 leaf에서 새로 만든 drift 아님.
- 조치: 이번 leaf에서 수정하지 않음.
- 후속: 기존 skill migration leaf에서 처리 필요.

대상:

- `.codex/skills/figma-comments-rest/scripts/read-comments.sh`
- `.codex/skills/task-close/scripts/update-vscode-workspace.mjs`
- `.codex/skills/task-close/scripts/worktree-remove.sh`
- `.codex/skills/task-intake/scripts/update-vscode-workspace.mjs`
- `.codex/skills/task-intake/scripts/worktree-add.sh`

## 후속 후보

- `chore: repo-local skill 문서 contract migration`.
- `docs: architecture contract 한국어 요약 layer 추가`.
- `docs: CI quality gate contract 문체 정리`.

## 완료 판단

- 즉시 수정 가능 drift 분리 완료.
- 구조 수정 필요 drift 분리 완료.
- 의미/계약 변경 위험 drift 분리 완료.
- 후속 leaf 후보 기록 완료.
