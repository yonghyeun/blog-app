import { failure, success } from "./result";
import type { ParsedFrontmatter, PostLoadResult, ValidPostFrontmatter } from "./types";

type ValidateFrontmatterOptions = {
  path?: string;
};

const requiredFields = ["slug", "title", "description", "tags"] as const;
const reservedFields = ["publishedAt", "updatedAt"] as const;

export const validateFrontmatter = (
  frontmatter: ParsedFrontmatter | Record<string, unknown>,
  options: ValidateFrontmatterOptions = {},
): PostLoadResult<ValidPostFrontmatter> => {
  for (const field of reservedFields) {
    if (frontmatter[field] !== undefined) {
      return failure([
        {
          code: "reserved-frontmatter-field",
          field,
          path: options.path,
        },
      ]);
    }
  }

  for (const field of requiredFields) {
    if (frontmatter[field] === undefined) {
      return failure([
        {
          code: "missing-frontmatter-field",
          field,
          path: options.path,
        },
      ]);
    }
  }

  if (!isString(frontmatter.slug)) {
    return invalidField("slug", options.path);
  }

  if (!isString(frontmatter.title)) {
    return invalidField("title", options.path);
  }

  if (!isString(frontmatter.description)) {
    return invalidField("description", options.path);
  }

  if (!Array.isArray(frontmatter.tags) || !frontmatter.tags.every(isString)) {
    return invalidField("tags", options.path);
  }

  if (frontmatter.type !== undefined && !isString(frontmatter.type)) {
    return invalidField("type", options.path);
  }

  return success({
    slug: frontmatter.slug,
    title: frontmatter.title,
    description: frontmatter.description,
    tags: frontmatter.tags,
    ...(frontmatter.type === undefined ? {} : { type: frontmatter.type }),
  });
};

const isString = (value: unknown): value is string => typeof value === "string";

const invalidField = (field: string, path?: string): PostLoadResult<never> =>
  failure([
    {
      code: "invalid-frontmatter-field",
      field,
      path,
    },
  ]);
