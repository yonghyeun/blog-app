import { failure, success } from "./result";
import type { ParsedFrontmatter, PostLoadResult, ValidPostFrontmatter } from "./types";

type ValidateFrontmatterOptions = {
  path?: string;
};

const requiredFields = ["slug", "title", "description", "tags"] as const;
const reservedFields = ["publishedAt", "updatedAt"] as const;

/**
 * parsed frontmatter가 post metadata 계약을 만족하는지 검증하고 typed metadata로 좁힌다.
 */
export const validateFrontmatter = (
  frontmatter: ParsedFrontmatter | Record<string, unknown>,
  { path }: ValidateFrontmatterOptions = {},
): PostLoadResult<ValidPostFrontmatter> => {
  for (const field of reservedFields) {
    if (frontmatter[field] !== undefined) {
      return failure([
        {
          code: "reserved-frontmatter-field",
          field,
          path,
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
          path,
        },
      ]);
    }
  }

  if (!isString(frontmatter.slug)) {
    return invalidField("slug", path);
  }

  if (!isString(frontmatter.title)) {
    return invalidField("title", path);
  }

  if (!isString(frontmatter.description)) {
    return invalidField("description", path);
  }

  if (!Array.isArray(frontmatter.tags) || !frontmatter.tags.every(isString)) {
    return invalidField("tags", path);
  }

  if (frontmatter.type !== undefined && !isString(frontmatter.type)) {
    return invalidField("type", path);
  }

  return success({
    slug: frontmatter.slug,
    title: frontmatter.title,
    description: frontmatter.description,
    tags: frontmatter.tags,
    ...(frontmatter.type === undefined ? {} : { type: frontmatter.type }),
  });
};

/**
 * unknown 값을 string frontmatter scalar로 좁히는 type guard다.
 */
const isString = (value: unknown): value is string => typeof value === "string";

/**
 * frontmatter field validation 실패를 표준 PostLoad issue로 만든다.
 */
const invalidField = (field: string, path?: string): PostLoadResult<never> =>
  failure([
    {
      code: "invalid-frontmatter-field",
      field,
      path,
    },
  ]);
