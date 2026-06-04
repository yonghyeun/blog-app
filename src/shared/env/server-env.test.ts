import { afterEach, describe, expect, it } from "vitest";

import {
  readBlogPostAssetUrlPrefix,
  readBlogPostRepoPath,
  readRequiredServerEnv,
} from "@/shared/env/server-env";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("서버 env loader", () => {
  it("필수 env가 설정되어 있으면 공백을 제거한 값을 반환한다", () => {
    process.env.BLOG_POST_REPO_PATH = "  tests/e2e/fixtures/blog-post-default  ";

    expect(readBlogPostRepoPath()).toBe("tests/e2e/fixtures/blog-post-default");
  });

  it("필수 env가 비어 있으면 env 이름을 포함한 오류를 던진다", () => {
    process.env.BLOG_POST_ASSET_URL_PREFIX = "";

    expect(() => readBlogPostAssetUrlPrefix()).toThrow(
      "BLOG_POST_ASSET_URL_PREFIX environment variable is required.",
    );
  });

  it("지정한 필수 env가 누락되어 있으면 env 이름을 포함한 오류를 던진다", () => {
    delete process.env.BLOG_POST_REPO_PATH;

    expect(() => readRequiredServerEnv("BLOG_POST_REPO_PATH")).toThrow(
      "BLOG_POST_REPO_PATH environment variable is required.",
    );
  });
});
