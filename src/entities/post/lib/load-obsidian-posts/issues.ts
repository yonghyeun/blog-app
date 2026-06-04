export type PostLoadIssue = {
  code: string;
  message: string;
  path?: string;
  field?: string;
  raw?: string;
  lineStart?: number;
  lineEnd?: number;
  reference?: string;
  matches?: string[];
  slug?: string;
  cause?: unknown;
};
