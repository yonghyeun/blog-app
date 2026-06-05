---
name: korean-doc-writer
description: Use when creating or editing Markdown documents, issue handoffs, repo operation notes, or skill docs that should be Korean-first, structured, concise, and easy to scan.
---

# Korean Doc Writer

## Goal

한국어 우선 Markdown 문서를 읽기 부담이 낮은 구조로 작성한다.

## When To Use

- Markdown 문서를 새로 작성할 때.
- 기존 Markdown 문서를 한국어 우선, 구조화, 단문 중심으로 고칠 때.
- issue handoff, closeout receipt, 운영 문서, skill 문서를 작성할 때.
- 사용자가 `문서`, `md`, `Markdown`, `정리`, `handoff`, `receipt` 작성을 요청할 때.

## Inputs / Arguments

관련 사항 없음. 이 skill은 추가 인자를 받지 않는다.

| Argument | Required | Default | Behavior                                          |
| -------- | -------- | ------- | ------------------------------------------------- |
| None     | no       | None    | 요청과 대상 문서의 맥락으로 작성 방식을 결정한다. |

## Workflow

1. 대상 문서의 독자와 목적을 확인한다.
2. 문체 기준이 필요하면 `docs/operations/agent-writing-style.md`를 읽는다.
3. 대상 문서가 별도 repo contract를 요구하면 `AGENTS.md`의 required reading을 따른다.
4. 문서를 `상태 / 근거 / 결정 / 다음 행동` 중 필요한 축으로 나눈다.
5. 한국어 우선으로 작성한다.
   - 기술 고유명사, 명령어, 파일 경로는 English token 유지.
   - 문장보다 불렛 우선.
   - 긴 배경 설명보다 현재 판단과 다음 행동 우선.
6. 문체를 정리한다.
   - `~하였습니다`, `~할 수 있습니다`, `~하는 것이 좋습니다` 최소화.
   - `완료.`, `필요.`, `리스크 존재.`, `추가 확인 필요.` 같은 단문 사용.
   - 한 불렛에는 하나의 판단만 둔다.
7. 예외를 확인한다.
   - 법적/대외 문서처럼 정중한 서술이 필요한 경우 평문형 종결 허용.
   - 사용자에게 그대로 보일 PR/issue 본문은 단문형을 유지하되 무례하게 줄이지 않는다.
8. 작성 후 체크리스트를 통과한다.

## Commands

관련 사항 없음. 이 skill은 문서화된 절차만 제공한다.

| Command | When            | Required Args | Optional Args | Preconditions              | Side Effects             | Output                | Failure / Next Action                                              |
| ------- | --------------- | ------------- | ------------- | -------------------------- | ------------------------ | --------------------- | ------------------------------------------------------------------ |
| None    | Not applicable. | None          | None          | 대상 문서와 목적이 확인됨. | Markdown 작성 또는 수정. | 구조화된 한국어 문서. | 문체 기준이 충돌하면 source issue 또는 사용자에게 예외를 기록한다. |

## Stop Conditions

- 대상 문서의 독자나 목적이 불명확하고, 임의 작성 시 의미가 바뀌는 경우.
- repo contract와 사용자의 문체 요청이 충돌하는 경우.
- 기존 문서를 전면 리라이트해야 하지만 issue scope가 새 skill/routing 추가로 제한된 경우.
- private token, private URL, concrete Figma file key가 문서에 들어가려는 경우.

## Verification

- 문서가 한국어 우선인지 확인.
- headings와 bullets만 훑어도 핵심 상태가 보이는지 확인.
- 각 불렛이 하나의 판단 또는 행동만 담는지 확인.
- 불필요한 `~하였습니다`, `~할 수 있습니다`, `~하는 것이 좋습니다` 표현 제거.
- 파일 경로, 명령어, issue 번호, PR 번호가 inline code 또는 명확한 token으로 남았는지 확인.
- repo-local skill 변경 시 `npm run validate:skills` 실행.

## References

- `docs/operations/agent-writing-style.md`: repo-local 문체 기준이 필요할 때 읽는다.
