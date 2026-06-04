import { StateText } from "@/shared/ui/state-text";

type EmptyArchiveStateProps = {
  label: string;
  message: string;
};

export function EmptyArchiveState({ label, message }: EmptyArchiveStateProps) {
  return (
    <section
      className="space-y-3 border-t border-border pt-8"
      aria-labelledby="empty-archive-title"
    >
      <p id="empty-archive-title" className="font-heading text-[12px] leading-[18px] text-muted">
        {label}
      </p>
      <StateText>{message}</StateText>
    </section>
  );
}
