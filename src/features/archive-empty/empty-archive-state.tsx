import { StateText } from "@/shared/ui/state-text";

type EmptyArchiveStateProps = {
  label: string;
  message: string;
};

export function EmptyArchiveState({ label, message }: EmptyArchiveStateProps) {
  return (
    <section
      className="space-y-6 border border-border bg-surface-muted p-6"
      aria-labelledby="empty-archive-title"
    >
      <p
        id="empty-archive-title"
        className="font-heading text-[22px] font-semibold leading-[30px] text-text"
      >
        {label}
      </p>
      <StateText>{message}</StateText>
    </section>
  );
}
