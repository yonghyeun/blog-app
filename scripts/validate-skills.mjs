#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---/;
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function usage() {
  return `Usage:
  node scripts/validate-skills.mjs [--skills-dir <path>]

Behavior:
  Validates repo-local skills against docs/operations/repo-local-skill-contract.md.
`;
}

function parseArgs(argv) {
  const args = {
    skillsDir: ".codex/skills",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }

    if (arg === "--skills-dir") {
      const value = argv[index + 1];
      if (!value) {
        return {
          error: "Missing value for --skills-dir. Pass --skills-dir <path>.",
        };
      }
      args.skillsDir = value;
      index += 1;
      continue;
    }

    return {
      error: `Unknown argument: ${arg}. Run node scripts/validate-skills.mjs --help.`,
    };
  }

  return args;
}

function parseFrontmatter(markdown) {
  const match = markdown.match(FRONTMATTER_PATTERN);
  if (!match) {
    return null;
  }

  const values = {};
  for (const line of match[1].split("\n")) {
    const fieldMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!fieldMatch) {
      continue;
    }

    const [, key, rawValue] = fieldMatch;
    values[key] = rawValue.trim().replace(/^["']|["']$/g, "");
  }

  return values;
}

function hasDocumentedScriptTestException(skillMarkdown, scriptRelativePath) {
  const normalizedPath = scriptRelativePath.replaceAll(path.sep, "/");
  const lowerMarkdown = skillMarkdown.toLowerCase();

  return (
    skillMarkdown.includes(normalizedPath) &&
    (lowerMarkdown.includes("colocated test exception") ||
      lowerMarkdown.includes("colocated test 예외") ||
      lowerMarkdown.includes("colocated test가 없는 이유"))
  );
}

function expectedTestPath(scriptPath) {
  const extension = path.extname(scriptPath);
  const basename = scriptPath.slice(0, -extension.length);
  return `${basename}.test${extension}`;
}

function collectScriptFiles(scriptsDir) {
  if (!fs.existsSync(scriptsDir)) {
    return [];
  }

  return fs
    .readdirSync(scriptsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(scriptsDir, entry.name))
    .filter((filePath) => {
      const extension = path.extname(filePath);
      return extension === ".sh" || extension === ".mjs";
    })
    .filter((filePath) => !filePath.includes(".test."));
}

function createIssue(skillName, problem, nextAction) {
  return {
    skillName,
    message: `${skillName}: ${problem}. ${nextAction}.`,
  };
}

export function validateSkills(options = {}) {
  const skillsDir = path.resolve(options.skillsDir ?? ".codex/skills");
  const issues = [];

  if (!fs.existsSync(skillsDir)) {
    return {
      ok: false,
      skillCount: 0,
      issues: [
        {
          skillName: null,
          message: `Skills directory not found: ${skillsDir}. Run from the repository root or pass --skills-dir <path>.`,
        },
      ],
    };
  }

  const skillEntries = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith("."))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of skillEntries) {
    const skillName = entry.name;
    const skillDir = path.join(skillsDir, skillName);
    const skillPath = path.join(skillDir, "SKILL.md");
    const agentPath = path.join(skillDir, "agents", "openai.yaml");

    if (!SKILL_NAME_PATTERN.test(skillName)) {
      issues.push(
        createIssue(
          skillName,
          "Skill directory name does not match lowercase kebab-case",
          "Rename the directory using lowercase letters, digits, and hyphens",
        ),
      );
    }

    if (!fs.existsSync(skillPath)) {
      issues.push(
        createIssue(
          skillName,
          "Missing SKILL.md",
          "Add SKILL.md with name and description frontmatter",
        ),
      );
      continue;
    }

    if (!fs.existsSync(agentPath)) {
      issues.push(
        createIssue(
          skillName,
          "Missing agents/openai.yaml",
          "Add agents/openai.yaml for the repo-local skill",
        ),
      );
    }

    const skillMarkdown = fs.readFileSync(skillPath, "utf8");
    const frontmatter = parseFrontmatter(skillMarkdown);

    if (!frontmatter) {
      issues.push(
        createIssue(
          skillName,
          "Missing YAML frontmatter in SKILL.md",
          "Add frontmatter with name and description fields",
        ),
      );
    } else {
      if (!frontmatter.name) {
        issues.push(
          createIssue(
            skillName,
            "Missing SKILL.md frontmatter field: name",
            "Add name matching the skill directory",
          ),
        );
      } else if (frontmatter.name !== skillName) {
        issues.push(
          createIssue(
            skillName,
            `SKILL.md frontmatter name '${frontmatter.name}' does not match directory '${skillName}'`,
            "Make the frontmatter name match the skill directory",
          ),
        );
      }

      if (!frontmatter.description) {
        issues.push(
          createIssue(
            skillName,
            "Missing SKILL.md frontmatter field: description",
            "Add a trigger-focused description",
          ),
        );
      }
    }

    for (const scriptPath of collectScriptFiles(path.join(skillDir, "scripts"))) {
      const testPath = expectedTestPath(scriptPath);
      if (fs.existsSync(testPath)) {
        continue;
      }

      const scriptRelativePath = path.relative(skillDir, scriptPath);
      if (hasDocumentedScriptTestException(skillMarkdown, scriptRelativePath)) {
        continue;
      }

      issues.push(
        createIssue(
          skillName,
          `Missing colocated test for ${scriptRelativePath.replaceAll(path.sep, "/")}`,
          `Add ${path.relative(skillDir, testPath).replaceAll(path.sep, "/")} or document a colocated test exception in SKILL.md`,
        ),
      );
    }
  }

  return {
    ok: issues.length === 0,
    skillCount: skillEntries.length,
    issues,
  };
}

function runCli() {
  const args = parseArgs(process.argv.slice(2));

  if (args.error) {
    console.error(args.error);
    console.error(usage());
    process.exitCode = 2;
    return;
  }

  if (args.help) {
    console.log(usage());
    return;
  }

  const result = validateSkills({ skillsDir: args.skillsDir });

  if (result.ok) {
    console.log(
      `Repo-local skill contract validation passed. Checked ${result.skillCount} skills.`,
    );
    return;
  }

  console.error(
    `Repo-local skill contract validation failed. Checked ${result.skillCount} skills.`,
  );
  for (const issue of result.issues) {
    console.error(`- ${issue.message}`);
  }
  process.exitCode = 1;
}

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  runCli();
}
