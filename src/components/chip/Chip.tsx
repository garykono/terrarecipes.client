import clsx from 'clsx';
import styles from './Chip.module.css';
import DeleteButton from '../buttons/DeleteButton';

export type ChipProps = {
    label: string;
    selected?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    onRemove?: () => void; 
    role?: "radio" | "checkbox"; 
    ariaChecked?: boolean;
    title?: string;
    className?: string;
};

export default function Chip({
    label,
    selected = false,
    disabled = false,
    onClick,
    onRemove,
    role,
    ariaChecked,
    title,
    className = "",
}: ChipProps) {
    return (
        <div
            className={clsx(
                styles.chip,
                selected && styles.chipSelected,
                disabled && styles.chipDisabled,
                className
            )}
            title={title}
        >
            <button
                type="button"
                className={styles.chipButton}
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
                {selected && (
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
                )}
                <span className={styles.chipLabel}>{label}</span>
            </button>

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
        </div>
    );
}
