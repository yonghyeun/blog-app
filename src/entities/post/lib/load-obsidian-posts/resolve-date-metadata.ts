import { failure, success } from "./result";
import type { DateMetadata, DateProviderResult, PostLoadResult, PostSource } from "./types";

type ResolveDateMetadataOptions = {
  dateProvider: (
    source: PostSource,
  ) => Promise<DateProviderResult | null> | DateProviderResult | null;
};

/**
 * dateProvider 값 또는 source mtime을 ISO date metadata로 정규화한다.
 */
export const resolveDateMetadata = async (
  source: PostSource,
  { dateProvider }: ResolveDateMetadataOptions,
): Promise<PostLoadResult<DateMetadata>> => {
  let providerValue: DateProviderResult | null;

  try {
    providerValue = await dateProvider(source);
  } catch (error) {
    return failure([
      {
        code: "date-provider-failed",
        path: source.path,
        cause: error,
      },
    ]);
  }

  const publishedAtValue = providerValue?.publishedAt ?? source.mtime;
  const updatedAtValue = providerValue?.updatedAt ?? source.mtime;
  const publishedAtResult = toIsoDate(publishedAtValue, "publishedAt", source.path);

  if (!publishedAtResult.ok) {
    return failure(publishedAtResult.error);
  }

  const updatedAtResult = toIsoDate(updatedAtValue, "updatedAt", source.path);

  if (!updatedAtResult.ok) {
    return failure(updatedAtResult.error);
  }

  return success({
    publishedAt: publishedAtResult.data,
    updatedAt: updatedAtResult.data,
  });
};

/**
 * Date/string 값을 ISO string으로 변환하고 누락/invalid date를 PostLoad issue로 만든다.
 */
const toIsoDate = (
  value: Date | string | null | undefined,
  field: "publishedAt" | "updatedAt",
  path: string,
): PostLoadResult<string> => {
  if (value === null || value === undefined) {
    return failure([
      {
        code: "missing-date-metadata",
        field,
        path,
      },
    ]);
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return failure([
      {
        code: "invalid-date-metadata",
        field,
        path,
      },
    ]);
  }

  return success(date.toISOString());
};
