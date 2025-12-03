import clsx from "clsx";
import { useMemo } from "react";
import styles from "./FacetChipPicker.module.css";
import Chip from "../chip/Chip";

export type FacetOption = { 
    id: string; 
    label: string; 
    disabled?: boolean 
};

export type FacetChipPickerProps = {
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    options: FacetOption[];
    multi: boolean;                 // false = single-select (radio-like)
    value: string[];                // selected IDs (array even for single-select)
    onChange: (next: string[]) => void;
    minSelected?: number;
    maxSelected?: number;           // optional cap for multi facets
    showClear?: boolean;
    className?: string;
};

export function FacetChipPicker({
    title = "",
    description,
    options,
    multi,
    value,
    onChange,
    minSelected,
    maxSelected,
    showClear = true,
    className = "",
}: FacetChipPickerProps) {
    const selected = useMemo(() => new Set(value), [value]);
    const reachedCap =
        multi && typeof maxSelected === "number" && selected.size >= maxSelected;

    const toggle = (id: string) => {
        if (multi) {
            const next = new Set(selected);
            if (next.has(id)) {
                next.delete(id)
            } else if (!reachedCap) {
                next.add(id);
            }
            onChange(Array.from(next));
        } else {
            // radio-like: allow deselect to "none"
            onChange(selected.has(id) ? [] : [id]);
        }
    };

    return (
        <div className={clsx(
            styles.facet,
            className
        )}>
            <div className={styles.facetHeader}>
                <div>
                    <span className={styles.facetTitle}>{title}</span>
                    {description && 
                        <span className={styles.facetDescription}>{description}</span>
                    }
                </div>
                {showClear && value.length > 0 && (
                    <button
                        type="button"
                        className={styles.facetClear}
                        onClick={() => onChange([])}
                    >
                        Clear
                    </button>
                )}
            </div>

            <div
                className={styles.facetOptions}
                role={multi ? "group" : "radiogroup"}
            >
                {options.map((option) => {
                    const isSelected = selected.has(option.id);
                    const isDisabled = option.disabled || (!isSelected && reachedCap);
                    return (
                        <Chip
                            key={option.id}
                            label={option.label}
                            selected={isSelected}
                            disabled={isDisabled}
                            onClick={() => toggle(option.id)}
                            role={multi ? "checkbox" : "radio"}
                            ariaChecked={isSelected}
                        />
                    );
                })}
            </div>

            {/* Optional: show count
                {multi && typeof maxSelected === "number" && minSelected && minSelected > 0 && value.length > 0 && (
                <div className="facet__count">
                    {selected.size}/{maxSelected} selected
                </div>
            )} */}
        </div>
    );
}