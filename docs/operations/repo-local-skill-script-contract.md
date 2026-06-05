# Repo-Local Skill Script 작성 계약

이 문서는 repo-local Codex skill 안에 들어가는 script 작성 기준이다.

적용 대상:

```text
.codex/skills/<skill-name>/scripts/
```

이 문서는 아래 구조 계약을 확장한다.

- [Repo-Local Skill 구조 계약](./repo-local-skill-contract.md)

## Contract Version

이 문서는 `repo-local-skill-script@1.0`을 정의한다.

Version syntax:

```text
<contract-id>@<major>.<minor>
```

규칙:

- Contract id: `repo-local-skill-script`.
- Current version: `1.0`.
- Major version 변경은 breaking script contract 변경.
- Minor version 변경은 additive 변경.
- Patch version은 사용하지 않음.
- script가 있는 `SKILL.md`는 frontmatter에 script contract를 선언한다.

Required frontmatter for skills with scripts:

```yaml
script_contract: repo-local-skill-script@1.0
```

Validator rule:

- script가 없으면 `script_contract`가 필요 없음.
- script가 있는데 `script_contract`가 없으면 migration 이후 drift.
- unsupported contract id 또는 major version은 실패.
- supported major의 newer minor version은 validator 지원 전까지 실패.

## 목적

skill script의 목적은 반복되는 운영 절차를 deterministic하게 만드는 것이다.

script는 다음 기준을 만족해야 한다.

- script 이름과 metadata만 보고 의도를 파악할 수 있어야 한다.
- local mutation과 remote mutation을 명확히 구분해야 한다.
- repository root에서 실행해도 안전해야 한다.
- agent와 사람이 같은 결과를 기대할 수 있어야 한다.
- 예외 사유가 없으면 colocated test를 가져야 한다.
- 실패 원인과 다음 행동을 같이 알려야 한다.

## Script를 만드는 기준

prose보다 code로 고정하는 편이 더 안전하고 검증하기 쉬운 절차라면 script를
만든다.

script를 만드는 경우:

- 반복되는 command orchestration
- worktree, branch, issue, PR, file bookkeeping처럼 일관성이 필요한 작업
- argument validation과 예측 가능한 error output
- deterministic formatting 또는 artifact generation
- 매번 다시 작성하면 위험한 remote API request
- local mutation 또는 remote mutation 전 safety check

script를 만들지 않는 경우:

- `SKILL.md`에 command 한 줄로 두는 편이 더 명확한 one-off command
- 판단이 핵심인 review 또는 planning step
- interactive agent reasoning에 의존하는 작업
- 서로 무관한 side effect를 숨기는 broad wrapper
- 이미 문서화된 repo contract를 중복 logic으로 대체하는 작업

command 자체가 단순해도 위험하면 script를 선호한다. 위험한 작업은 validation,
dry-run, next-action error message가 일관되어야 한다.

## 위치와 이름

script는 반드시 소유 skill 아래에 둔다.

```text
.codex/skills/<skill-name>/scripts/<action>.sh
```

규칙:

- `worktree-add.sh`, `read-comments.sh`처럼 action-oriented name을 쓴다.
- 하나의 script는 하나의 primary operation만 가진다.
- shared helper를 `.codex/skills/scripts`에 두지 않는다.
- 다른 skill의 private `scripts/` directory에 의존하지 않는다.
- 여러 skill에서 같은 동작이 필요해지면 shared tooling 추가 전에 별도
  follow-up issue를 만든다.

## Shell Style 기준

shell script는 Bash를 기본으로 한다. 다른 runtime이 필요하면 source issue에
이유를 남긴다.

필수 baseline:

```bash
#!/usr/bin/env bash
set -euo pipefail
```

style 규칙:

- word splitting이 의도된 경우가 아니면 variable expansion을 quote한다.
- flag parsing은 explicit loop 또는 작고 deterministic한 parser로 처리한다.
- usage text는 `usage()` function에 둔다.
- mutation 전에 required args를 검증한다.
- repo file을 건드릴 때는 `git rev-parse --show-toplevel` 기준으로 path를
  계산한다.
- 계산된 output에는 `printf`를 선호한다.
- error는 stderr로 쓴다.
- stdout은 success output 또는 machine-readable output 용도로 유지한다.
- args나 env vars로 명시할 수 있는 동작을 hidden global state로 만들지 않는다.
- mutation에는 broad shell glob을 피한다.
- interactive shell에서만 동작하는 alias나 shell option을 쓰지 않는다.

피해야 할 것:

- 문서화된 precondition 밖의 current-directory 가정
- mutating path에서 unquoted command substitution 사용
- validation 실패 뒤 silent fallback
- 일부 작업이 실패했는데 catch-all success message 출력
- confirmation 또는 documented force flag 없는 destructive cleanup

## Input 처리

script input은 positional args, flags, environment variables, stdin 중 하나일 수
있다.

모든 input은 owning `SKILL.md` command table 또는 연결된 script metadata section에
문서화한다.

### Required Args 기준

required args 기준:

- side effect 전에 검증한다.
- 누락되거나 invalid하면 exit code `2`로 실패한다.
- error message에 누락된 input 이름을 적는다.
- 다음 행동을 함께 제시한다.

예시:

```text
Missing issue number. Pass --issue <number> or provide an issue URL.
```

### Optional Args 기준

optional args 기준:

- default를 문서화한다.
- script에 help output이 있다면 `--help`에 표시한다.
- option name이 명확하지 않다면 mutation scope를 바꾸지 않는다.

동작을 바꾸는 option은 explicit flag로 둔다.

예시:

```text
--dry-run
--no-code-add
--base origin/main
--worktree <path>
```

### Environment Variables 기준

environment variable은 다음 경우에만 쓴다.

- CLI가 이미 기대하는 credential 또는 token
- 기존 repo-local behavior와의 호환
- normal command usage를 복잡하게 만들지 않기 위한 opt-out behavior

규칙:

- 지원하는 env var를 모두 문서화한다.
- required business input에는 env var를 피한다.
- reviewable workflow decision에는 env var보다 flag를 선호한다.
- secret을 echo하지 않는다.

### Stdin 기준

stdin은 streamed content를 처리하거나 CLI contract가 요구할 때만 쓴다.

규칙:

- stdin이 required인지 optional인지 문서화한다.
- required stdin이 없으면 빠르게 실패한다.
- stdin과 무관한 positional content를 섞지 않는다.

## Side Effect 표기

모든 script는 side effect를 local mutation, remote mutation, read-only behavior로
분류해야 한다.

local mutation 예시:

- file 생성, 수정, 삭제
- worktree 생성
- workspace file 갱신
- commit 생성
- local branch 변경

remote mutation 예시:

- GitHub issue 또는 PR 수정
- comment 생성
- branch push
- label 변경
- write API 호출

read-only 예시:

- issue state 조회
- label 목록 조회
- planned command 출력
- local file structure validation

규칙:

- skill workflow에서 script를 사용하기 전에 side effect를 문서화한다.
- 가능하면 read-only check와 mutation을 분리한다.
- remote write가 있었다면 success output에 무엇을 썼는지 드러낸다.
- read-only처럼 보이는 command name 뒤에 remote mutation을 숨기지 않는다.

## Exit Code 의미

script exit code는 예측 가능해야 한다.

기본 의미:

| Exit Code | 의미                                        |
| --------- | ------------------------------------------- |
| `0`       | 성공.                                       |
| `1`       | runtime failure 또는 unmet external state.  |
| `2`       | usage error, invalid args, invalid env.     |
| `3`       | intake, policy, precondition failure.       |
| `4`       | destructive action에 confirmation이 필요함. |

규칙:

- 이 baseline 밖의 script-specific exit code는 문서화한다.
- required mutation이 실패했는데 `0`을 반환하지 않는다.
- child validator 결과를 전달하는 script라면 의미 있는 child exit code를 보존한다.

## Error Message 기준

script error message는 next-action 형식이어야 한다.

형식:

```text
<problem>. <next action>.
```

예시:

```text
Worktree path already exists. Choose --worktree <path> or run task-close first.
```

```text
GitHub issue is missing acceptance criteria. Update the issue body before intake.
```

```text
GitHub API request failed. Re-run with GH_DEBUG=api and check token permissions.
```

규칙:

- 필요하면 실패한 target을 포함한다.
- next action은 구체적으로 쓴다.
- token, file key, secret을 노출하지 않는다.
- `Failed`, `Invalid input`, `Something went wrong`처럼 모호한 message를 피한다.

## Dry Run, Confirmation, Destructive Action

local 또는 remote state를 바꾸는 script는 planned action을 정확히 표현할 수 있으면
`--dry-run`을 지원해야 한다.

dry-run 규칙:

- 무엇이 바뀔지 출력한다.
- file을 쓰지 않는다.
- issue, PR, label, comment를 수정하지 않는다.
- branch, worktree, commit을 만들지 않는다.
- local planned mutation과 remote planned mutation을 구분해서 출력한다.

destructive action에는 confirmation이 필요하다. 단, 현재 task에서 사용자가 해당
destructive action을 명시적으로 요청했고 script가 그 작업을 위해 설계된 경우는
예외다.

destructive action 예시:

- worktree 삭제
- file 삭제
- issue close
- issue ownership label 변경
- branch force update

confirmation 규칙:

- `--yes` 또는 비슷하게 명확한 flag를 쓴다.
- confirmation이 필요한데 없으면 exit code `4`로 실패한다.
- 필요한 다음 command 또는 flag를 정확히 출력한다.
- raw destructive command보다 repo-local cleanup script를 선호한다.

## Colocated Test 기준

script test는 test 대상 script 옆에 둔다.

예시:

```text
scripts/worktree-add.sh
scripts/worktree-add.test.sh
```

```text
scripts/update-vscode-workspace.mjs
scripts/update-vscode-workspace.test.mjs
```

규칙:

- script basename을 유지하고 extension 앞에 `.test`를 추가한다.
- argument parsing failure를 test한다.
- dry-run을 지원하면 dry-run behavior를 test한다.
- 중요한 side-effect boundary는 temporary directory 또는 mocked command로
  test한다.
- 흔한 실패의 next-action error message를 test한다.
- script가 trivial하거나 현실적으로 test하기 어렵다면 예외를 문서화한다.

예외 문서에는 다음을 적는다.

- colocated test가 없는 이유
- 대신 어떤 verification command 또는 manual check가 담당하는지
- 임시 예외라면 coverage를 추가할 follow-up issue

## Script Metadata 기준

script를 가진 skill은 script metadata를 문서화해야 한다.

minimum schema:

| Field        | Required | 의미                                         |
| ------------ | -------- | -------------------------------------------- |
| Script Path  | yes      | `scripts/` 아래 path.                        |
| Test Path    | yes      | colocated test path 또는 문서화된 예외 사유. |
| Purpose      | yes      | script가 고정하는 deterministic behavior.    |
| Inputs       | yes      | args, env vars, stdin.                       |
| Side Effects | yes      | local mutation 또는 remote mutation.         |
| Exit Codes   | yes      | 중요한 exit code 의미.                       |
| Error Style  | yes      | next-action error 준수 여부.                 |

metadata가 짧으면 `SKILL.md`에 둔다. metadata가 길어서 `SKILL.md`를 읽기 어렵게
만들 때만 skill-local `references/` file로 분리한다.

## 후속 Leaf 범위

이 문서는 enforcement를 구현하지 않는다.

후속 leaf 범위:

- validator 구현
- CI quality gate 편입
- 기존 skill script migration
- 기존 script에 빠진 colocated test 추가
- repo-local skill 위치를 `.codex/skills`에서 다른 path로 바꾸는 결정
