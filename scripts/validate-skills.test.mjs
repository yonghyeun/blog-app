import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
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

test("passes a skill with required files and frontmatter", () => {
  const root = makeTempSkillsDir();
  writeSkill(root, "task-example");

  const result = validateSkills({ skillsDir: root });

  assert.equal(result.ok, true);
  assert.equal(result.skillCount, 1);
  assert.deepEqual(result.issues, []);
});

test("fails when SKILL.md is missing", () => {
  const root = makeTempSkillsDir();
  const skillDir = path.join(root, "missing-skill-md");
  fs.mkdirSync(path.join(skillDir, "agents"), { recursive: true });
  fs.writeFileSync(path.join(skillDir, "agents", "openai.yaml"), "version: 1\n");

  const result = validateSkills({ skillsDir: root });

  assert.equal(result.ok, false);
  assert.match(result.issues[0].message, /Missing SKILL\.md/);
  assert.match(result.issues[0].message, /Add SKILL\.md/);
});

test("fails when agents/openai.yaml is missing", () => {
  const root = makeTempSkillsDir();
  const skillDir = writeSkill(root, "missing-agent");
  fs.rmSync(path.join(skillDir, "agents", "openai.yaml"));

  const result = validateSkills({ skillsDir: root });

  assert.equal(result.ok, false);
  assert.match(result.issues[0].message, /Missing agents\/openai\.yaml/);
  assert.match(result.issues[0].message, /Add agents\/openai\.yaml/);
});

test("fails when frontmatter name is missing", () => {
  const root = makeTempSkillsDir();
  const skillDir = writeSkill(root, "missing-name");
  fs.writeFileSync(
    path.join(skillDir, "SKILL.md"),
    "---\ndescription: Use when testing missing names.\n---\n\n# Missing Name\n",
  );

  const result = validateSkills({ skillsDir: root });

  assert.equal(result.ok, false);
  assert.match(result.issues[0].message, /frontmatter field: name/);
  assert.match(result.issues[0].message, /Add name/);
});

test("fails when frontmatter description is missing", () => {
  const root = makeTempSkillsDir();
  const skillDir = writeSkill(root, "missing-description");
  fs.writeFileSync(
    path.join(skillDir, "SKILL.md"),
    "---\nname: missing-description\n---\n\n# Missing Description\n",
  );

  const result = validateSkills({ skillsDir: root });

  assert.equal(result.ok, false);
  assert.match(result.issues[0].message, /frontmatter field: description/);
  assert.match(result.issues[0].message, /Add a trigger-focused description/);
});

test("fails when frontmatter name differs from directory name", () => {
  const root = makeTempSkillsDir();
  writeSkill(root, "expected-name", { frontmatterName: "other-name" });

  const result = validateSkills({ skillsDir: root });

  assert.equal(result.ok, false);
  assert.match(result.issues[0].message, /does not match directory/);
  assert.match(result.issues[0].message, /Make the frontmatter name match/);
});

test("fails when a script has no colocated test or documented exception", () => {
  const root = makeTempSkillsDir();
  const skillDir = writeSkill(root, "script-skill");
  fs.mkdirSync(path.join(skillDir, "scripts"));
  fs.writeFileSync(path.join(skillDir, "scripts", "run.sh"), "#!/usr/bin/env bash\n");

  const result = validateSkills({ skillsDir: root });

  assert.equal(result.ok, false);
  assert.match(result.issues[0].message, /Missing colocated test/);
  assert.match(result.issues[0].message, /Add scripts\/run\.test\.sh/);
});

test("passes when a script has a colocated test", () => {
  const root = makeTempSkillsDir();
  const skillDir = writeSkill(root, "tested-script-skill");
  fs.mkdirSync(path.join(skillDir, "scripts"));
  fs.writeFileSync(path.join(skillDir, "scripts", "run.sh"), "#!/usr/bin/env bash\n");
  fs.writeFileSync(path.join(skillDir, "scripts", "run.test.sh"), "#!/usr/bin/env bash\n");

  const result = validateSkills({ skillsDir: root });

  assert.equal(result.ok, true);
});

test("passes when a script test exception is documented", () => {
  const root = makeTempSkillsDir();
  const skillDir = writeSkill(root, "exception-script-skill", {
    extraMarkdown:
      "\n## Script Metadata\n\n- Script Path: scripts/run.mjs\n- Test Path: colocated test exception. colocated test가 없는 이유: manual verification only.\n",
  });
  fs.mkdirSync(path.join(skillDir, "scripts"));
  fs.writeFileSync(path.join(skillDir, "scripts", "run.mjs"), "console.log('ok');\n");

  const result = validateSkills({ skillsDir: root });

  assert.equal(result.ok, true);
});
