import clsx from "clsx";

export type ChipVariant =
    | "tag"
    | "status"
    | "filter"
    | "input"
    | "label";

type ChipProps = {
    variant?: ChipVariant;
    selected?: boolean;        // for filter chips
    leftDot?: boolean;         // for tag/status
    onRemove?: () => void;     // for input chips
    ariaRemoveLabel?: string;
    className?: string;
    children: React.ReactNode;
} & React.HTMLAttributes<HTMLSpanElement>;

export function Chip({
    variant = "tag",
    selected = false,
    leftDot = false,
    onRemove,
    ariaRemoveLabel = "Remove",
    className,
    children,
    ...props
}: ChipProps) {
    const base = "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium";

    // Variant-specific styling logic
    const variants: Record<ChipVariant, string> = {
        tag: `
            bg-brand-subtle
            text-text-muted
        `,

        status: `
            bg-brand-accent/10
            text-brand-accent
            border border-brand-accent/30
        `,

        filter: selected
        ? `
            bg-brand-accent text-white
            hover:bg-brand-accent-strong
        `
        : `
            border border-black/10
            text-text-secondary
            bg-transparent
            hover:border-black/20
        `,

        input: `
            bg-brand-subtle text-text-muted
        `,

        label: `
            bg-brand-subtle/80
            text-brand-accent
            border border-black/5
            tracking-wide
        `,
    };

    const removable = variant === "input" && onRemove;

    return (
        <span
            className={clsx(
                base,
                variants[variant],
                removable && "pr-1.5", // room for the X button
                className
            )}
            {...props}
        >
            {leftDot && (
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
            )}

            <span>{children}</span>

            {removable && (
                <button
                    type="button"
                    aria-label={ariaRemoveLabel}
                    onClick={onRemove}
                    className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[10px] hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-brand-accent/60"
                >
                    ×
                </button>
            )}
        </span>
    );
}