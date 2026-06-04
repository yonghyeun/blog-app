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
        message: `${source.path} 게시글의 dateProvider(source) 실행 중 오류가 발생했습니다.`,
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
        message: `${path} 게시글의 ${field} 날짜 metadata가 없습니다. dateProvider 결과와 source.mtime을 모두 확인했지만 값을 찾지 못했습니다.`,
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
        message: `${path} 게시글의 ${field} 날짜 metadata가 유효한 날짜가 아닙니다. 받은 값: ${formatDateValue(value)}`,
        field,
        path,
      },
    ]);
  }

  return success(date.toISOString());
};

/**
 * 날짜 metadata 오류 메시지에 넣을 입력값을 사람이 읽을 수 있는 문자열로 변환한다.
 */
const formatDateValue = (value: Date | string) =>
  value instanceof Date ? value.toString() : `"${value}"`;
