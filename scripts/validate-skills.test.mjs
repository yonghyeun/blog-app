import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { validateSkills } from "./validate-skills.mjs";

function makeTempSkillsDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "blog-app-skills-"));
}

function writeSkill(root, name, options = {}) {
  const skillDir = path.join(root, name);
  fs.mkdirSync(path.join(skillDir, "agents"), { recursive: true });
  fs.writeFileSync(path.join(skillDir, "agents", "openai.yaml"), "version: 1\n");

  const frontmatterName = options.frontmatterName ?? name;
  const description =
    options.description === undefined
      ? "Use when validating repo-local skill fixtures."
      : options.description;
  const frontmatter = options.omitFrontmatter
    ? ""
    : `---\nname: ${frontmatterName}\ndescription: ${description}\n---\n\n`;

  fs.writeFileSync(
    path.join(skillDir, "SKILL.md"),
    `${frontmatter}# ${name}\n\n## Goal\n\nValidate fixture behavior.\n${options.extraMarkdown ?? ""}`,
  );

  return skillDir;
}

describe("repo-local skill validator 검증", () => {
  it("필수 파일과 frontmatter가 있는 skill을 입력하면 통과 결과를 반환한다", () => {
    const root = makeTempSkillsDir();
    writeSkill(root, "task-example");

    const result = validateSkills({ skillsDir: root });

    expect(result.ok).toBe(true);
    expect(result.skillCount).toBe(1);
    expect(result.issues).toEqual([]);
  });

  it("SKILL.md가 없으면 추가 안내가 포함된 실패 결과를 반환한다", () => {
    const root = makeTempSkillsDir();
    const skillDir = path.join(root, "missing-skill-md");
    fs.mkdirSync(path.join(skillDir, "agents"), { recursive: true });
    fs.writeFileSync(path.join(skillDir, "agents", "openai.yaml"), "version: 1\n");

    const result = validateSkills({ skillsDir: root });

    expect(result.ok).toBe(false);
    expect(result.issues[0].message).toMatch(/Missing SKILL\.md/);
    expect(result.issues[0].message).toMatch(/Add SKILL\.md/);
  });

  it("agents/openai.yaml이 없으면 추가 안내가 포함된 실패 결과를 반환한다", () => {
    const root = makeTempSkillsDir();
    const skillDir = writeSkill(root, "missing-agent");
    fs.rmSync(path.join(skillDir, "agents", "openai.yaml"));

    const result = validateSkills({ skillsDir: root });

    expect(result.ok).toBe(false);
    expect(result.issues[0].message).toMatch(/Missing agents\/openai\.yaml/);
    expect(result.issues[0].message).toMatch(/Add agents\/openai\.yaml/);
  });

  it("frontmatter name이 없으면 name 추가 안내가 포함된 실패 결과를 반환한다", () => {
    const root = makeTempSkillsDir();
    const skillDir = writeSkill(root, "missing-name");
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      "---\ndescription: Use when testing missing names.\n---\n\n# Missing Name\n",
    );

    const result = validateSkills({ skillsDir: root });

    expect(result.ok).toBe(false);
    expect(result.issues[0].message).toMatch(/frontmatter field: name/);
    expect(result.issues[0].message).toMatch(/Add name/);
  });

  it("frontmatter description이 없으면 description 추가 안내가 포함된 실패 결과를 반환한다", () => {
    const root = makeTempSkillsDir();
    const skillDir = writeSkill(root, "missing-description");
    fs.writeFileSync(
      path.join(skillDir, "SKILL.md"),
      "---\nname: missing-description\n---\n\n# Missing Description\n",
    );

    const result = validateSkills({ skillsDir: root });

    expect(result.ok).toBe(false);
    expect(result.issues[0].message).toMatch(/frontmatter field: description/);
    expect(result.issues[0].message).toMatch(/Add a trigger-focused description/);
  });

  it("frontmatter name이 directory와 다르면 이름 일치 안내가 포함된 실패 결과를 반환한다", () => {
    const root = makeTempSkillsDir();
    writeSkill(root, "expected-name", { frontmatterName: "other-name" });

    const result = validateSkills({ skillsDir: root });

    expect(result.ok).toBe(false);
    expect(result.issues[0].message).toMatch(/does not match directory/);
    expect(result.issues[0].message).toMatch(/Make the frontmatter name match/);
  });

  it("script에 colocated test와 예외 문서가 없으면 test 추가 안내가 포함된 실패 결과를 반환한다", () => {
    const root = makeTempSkillsDir();
    const skillDir = writeSkill(root, "script-skill");
    fs.mkdirSync(path.join(skillDir, "scripts"));
    fs.writeFileSync(path.join(skillDir, "scripts", "run.sh"), "#!/usr/bin/env bash\n");

    const result = validateSkills({ skillsDir: root });

    expect(result.ok).toBe(false);
    expect(result.issues[0].message).toMatch(/Missing colocated test/);
    expect(result.issues[0].message).toMatch(/Add scripts\/run\.test\.sh/);
  });

  it("script에 colocated test가 있으면 통과 결과를 반환한다", () => {
    const root = makeTempSkillsDir();
    const skillDir = writeSkill(root, "tested-script-skill");
    fs.mkdirSync(path.join(skillDir, "scripts"));
    fs.writeFileSync(path.join(skillDir, "scripts", "run.sh"), "#!/usr/bin/env bash\n");
    fs.writeFileSync(path.join(skillDir, "scripts", "run.test.sh"), "#!/usr/bin/env bash\n");

    const result = validateSkills({ skillsDir: root });

    expect(result.ok).toBe(true);
  });

  it("script test 예외가 문서화되어 있으면 통과 결과를 반환한다", () => {
    const root = makeTempSkillsDir();
    const skillDir = writeSkill(root, "exception-script-skill", {
      extraMarkdown:
        "\n## Script Metadata\n\n- Script Path: scripts/run.mjs\n- Test Path: colocated test exception. colocated test가 없는 이유: manual verification only.\n",
    });
    fs.mkdirSync(path.join(skillDir, "scripts"));
    fs.writeFileSync(path.join(skillDir, "scripts", "run.mjs"), "console.log('ok');\n");

    const result = validateSkills({ skillsDir: root });

    expect(result.ok).toBe(true);
  });
});
