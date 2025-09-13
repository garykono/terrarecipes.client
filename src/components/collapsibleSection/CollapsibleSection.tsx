import styles from "./CollapsibleSection.module.css";
import { useId, useState } from "react";

export type CollapsibleSectionProps = {
    title: string | React.ReactNode;
    description?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    open?: boolean;
    /** Controlled state change (optional) */
    onOpenChange?: (next: boolean) => void;
    className?: string;
    /** Optional id prefix (for aria-controls / region) */
    id?: string;
};

export function CollapsibleSection({
    title,
    children,
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    description,
    className = "",
    id,
}: CollapsibleSectionProps) {
    const internalId = useId();
    const sectionId = id ?? `collapsible-${internalId}`;
    const regionId = `${sectionId}-region`;

    const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

    const setOpen = (next: boolean) => {
        if (!isControlled) setUncontrolledOpen(next);
        onOpenChange?.(next);
    };

    return (
        <div className={styles.collapsible}>
            <div className={styles.collapsibleHeader}>
                <button
                    type="button"
                    className={styles.collapsibleToggle}
                    aria-expanded={isOpen}
                    aria-controls={regionId}
                    onClick={() => setOpen(!isOpen)}
                >
                    <span className={styles.collapsibleChevron} aria-hidden>
                        {isOpen ? "▼" : "▶"}
                    </span>
                    <span className={styles.collapsibleTitle}>{title}</span>
                </button>

                {description && <div className={styles.collapsibleDescription}>{description}</div>}
            </div>

            <div
                id={regionId}
                role="region"
                aria-labelledby={sectionId}
                className={[styles.collapsibleBody, isOpen ? styles.isOpen : styles.isClosed].join(" ")}
                hidden={!isOpen}
            >
                {children}
            </div>
        </div>
    );
}