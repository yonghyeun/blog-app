import { StateText } from "@/shared/ui/state-text";
import { TextLink } from "@/shared/ui/text-link";

type PostNotFoundStateProps = {
  label: string;
  message: string;
  backHref: string;
  backLabel: string;
};

export function PostNotFoundState({ backHref, backLabel, label, message }: PostNotFoundStateProps) {
  return (
    <section
      className="space-y-6 border border-border bg-surface-muted p-6"
      aria-labelledby="post-not-found-title"
    >
      <div className="space-y-6">
        <p
          id="post-not-found-title"
          className="font-heading text-[1.375rem] font-semibold leading-[1.875rem] text-text"
        >
          {label}
        </p>
        <StateText>{message}</StateText>
      </div>
      <TextLink href={backHref}>{backLabel}</TextLink>
    </section>
  );
}
