import { StateText } from "@/shared/ui/state-text";
import { TextLink } from "@/shared/ui/text-link";

type PostNotFoundStateProps = {
  label: string;
  message: string;
  backHref: string;
  backLabel: string;
};

export function PostNotFoundState({
  backHref,
  backLabel,
  label,
  message,
}: PostNotFoundStateProps) {
  return (
    <section className="space-y-5 border-t border-border pt-8" aria-labelledby="post-not-found-title">
      <div className="space-y-3">
        <p id="post-not-found-title" className="font-heading text-[12px] leading-[18px] text-muted">
          {label}
        </p>
        <StateText>{message}</StateText>
      </div>
      <TextLink href={backHref}>{backLabel}</TextLink>
    </section>
  );
}
