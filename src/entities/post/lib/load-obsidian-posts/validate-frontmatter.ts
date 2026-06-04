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
          message: `${formatPath(path)} frontmatter의 ${field} 값은 작성자가 직접 넣을 수 없습니다. 받은 값: ${formatValue(frontmatter[field])}`,
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
          message: `${formatPath(path)} frontmatter에 필수 값 ${field}이 없습니다.`,
          field,
          path,
        },
      ]);
    }
  }

  if (!isString(frontmatter.slug)) {
    return invalidField("slug", frontmatter.slug, path);
  }

  if (!isString(frontmatter.title)) {
    return invalidField("title", frontmatter.title, path);
  }

  if (!isString(frontmatter.description)) {
    return invalidField("description", frontmatter.description, path);
  }

  if (!Array.isArray(frontmatter.tags) || !frontmatter.tags.every(isString)) {
    return invalidField("tags", frontmatter.tags, path);
  }

  if (frontmatter.type !== undefined && !isString(frontmatter.type)) {
    return invalidField("type", frontmatter.type, path);
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
const invalidField = (field: string, value: unknown, path?: string): PostLoadResult<never> =>
  failure([
    {
      code: "invalid-frontmatter-field",
      message: `${formatPath(path)} frontmatter의 ${field} 값 형식이 올바르지 않습니다. 받은 값: ${formatValue(value)}`,
      field,
      path,
    },
  ]);

/**
 * validation 메시지에서 source path 누락을 명시적으로 드러낸다.
 */
const formatPath = (path: string | undefined) => (path === undefined ? "(unknown path)" : path);

/**
 * frontmatter validation 메시지에 넣을 입력값을 사람이 읽을 수 있는 문자열로 변환한다.
 */
const formatValue = (value: unknown) => {
  if (typeof value === "string") {
    return `"${value}"`;
  }

  const jsonValue = JSON.stringify(value);

  return jsonValue === undefined ? String(value) : jsonValue;
};
