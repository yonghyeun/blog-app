export type PostLoadIssue = {
  code: string;
  path?: string;
  field?: string;
  raw?: string;
  lineStart?: number;
  lineEnd?: number;
  reference?: string;
  matches?: string[];
  slug?: string;
  message?: string;
  cause?: unknown;
};
