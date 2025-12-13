import clsx from "clsx";

export function ChipGroup({
    children,
    className,
    ariaLabel,
}: {
    children: React.ReactNode;
    className?: string;
    ariaLabel?: string;
}) {
    return (
        <div
            className={clsx("flex flex-wrap gap-2", className)}
            aria-label={ariaLabel}
        >
            {children}
        </div>
    );
}