import clsx from 'clsx';
import styles from './Chip.module.css';
import DeleteButton from '../buttons/DeleteButton';

export type ChipVariant =
    | "tag"
    | "status"
    | "filter"
    | "input"
    | "label";

const variantClassMap: Record<ChipVariant, string> = {
    tag: styles.chipTag,
    status: styles.chipStatus,
    filter: styles.chipFilter,
    input: styles.chipInput,
    label: styles.chipLabelChip,
};

export type ChipProps = {
    variant?: ChipVariant;
    selected?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    onRemove?: () => void; 
    role?: "radio" | "checkbox"; 
    ariaChecked?: boolean;
    title?: string;
    className?: string;
    children: React.ReactNode;
};

export default function Chip({
    variant = "tag",
    selected = false,
    disabled = false,
    onClick,
    onRemove,
    role,
    ariaChecked,
    title,
    className = "",
    children
}: ChipProps) {
        
    const rootClassName = clsx(
        styles.chip,
        variantClassMap[variant],
        selected && styles.chipSelected,
        disabled && styles.chipDisabled,
        className
    );

    const showCheckmark = selected && (variant === "filter" || variant === "input");

    if (!onClick) {
        return (
            <span className={clsx(rootClassName, styles.chipStatic)} title={title}>
                {showCheckmark && checkmark}
                <span className={styles.chipLabel}>{children}</span>
                

                {onRemove && (
                    <DeleteButton 
                        iconClassName={styles.chipRemoveIcon}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        tabIndex={-1}
                    />
                )}
            </span>
        );
    }

    return (
        <div
            className={rootClassName}
            title={title}
        >
            <button
                type="button"
                className={clsx(styles.chipStatic, styles.chipButton)}
                role={role}
                aria-checked={ariaChecked}
                aria-pressed={role ? undefined : selected}
                disabled={disabled}
                onClick={onClick}
                onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !disabled) {
                    e.preventDefault();
                    onClick?.();
                }
                }}
            >
                {showCheckmark && checkmark}
                <span className={styles.chipLabel}>{children}</span>

                {onRemove && (
                    <DeleteButton 
                        iconClassName={styles.chipRemoveIcon}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        tabIndex={-1}
                    />
                )}
            </button>
        </div>
    );
}

const checkmark = 
    <svg
        className={styles.chipCheck}
        viewBox="0 0 20 20"
        aria-hidden="true"
        focusable="false"
    >
        <path
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.4 7.4a1 1 0 0 1-1.4 0L3.3 10.4a1 1 0 1 1 1.4-1.4l3.1 3.1 6.6-6.6a1 1 0 0 1 1.3-0.2z"
        fill="currentColor"
        fillRule="evenodd"
        />
    </svg>