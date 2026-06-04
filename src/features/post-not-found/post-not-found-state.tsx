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
      className="space-y-6 border border-strong bg-strong p-6 text-inverse"
      aria-labelledby="post-not-found-title"
    >
      <div className="space-y-6">
        <p
          id="post-not-found-title"
          className="font-heading text-[22px] font-semibold leading-[30px] text-inverse"
        >
          {label}
        </p>
        <StateText className="text-inverse">{message}</StateText>
      </div>
      <TextLink href={backHref} className="text-inverse decoration-inverse hover:text-inverse">
        {backLabel}
      </TextLink>
    </section>
  );
}
