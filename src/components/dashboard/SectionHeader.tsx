interface Props {
  eyebrow: string;
  title: string;
  description?: string;
}
export const SectionHeader = ({ eyebrow, title, description }: Props) => (
  <div className="mb-5 animate-fade-in-up">
    <p className="text-[11px] uppercase tracking-[0.18em] text-primary font-semibold">{eyebrow}</p>
    <h2 className="text-2xl lg:text-3xl font-display font-semibold mt-1">{title}</h2>
    {description && <p className="text-sm text-muted-foreground mt-1.5 max-w-3xl">{description}</p>}
  </div>
);