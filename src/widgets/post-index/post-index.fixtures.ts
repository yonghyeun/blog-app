import type { PostIndexListPost } from "@/widgets/post-index/post-index-list";

export const postIndexFixture = [
  {
    href: "/posts/renderer-boundary",
    title: "렌더러 경계 설계",
    description: "Obsidian 원천 문서를 AST로 분리하고 UI는 headless props만 소비한다.",
    publishedAt: "2026-06-03",
    tags: ["architecture", "renderer"],
  },
  {
    href: "/posts/figma-handoff",
    title: "Figma handoff 정리",
    description: "컴포넌트 역할, 상태, 계층을 코드 구현 전에 정렬한다.",
    publishedAt: "2026-06-02",
    tags: ["design", "storybook"],
  },
  {
    href: "/posts/content-loader",
    title: "콘텐츠 loader와 AST",
    description: "Markdown 문자열 변환이 아니라 renderer가 소비할 문서 단위로 적재한다.",
    publishedAt: "2026-06-01",
    tags: ["obsidian", "loader"],
  },
] satisfies PostIndexListPost[];
