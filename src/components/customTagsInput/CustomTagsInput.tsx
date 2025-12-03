import { useRef, useState } from "react";
import styles from "./CustomTagsInput.module.css";
import Chip from "../chip/Chip";
import FormMessage from "../formMessage/FormMessage";

export type CustomTagsInputProps = {
  title?: string | React.ReactNode;
  value: string[];                       
  onChange: (next: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  reservedPrefixes?: string[];            // block system-like tags (e.g., diet-)
  tryPromoteLabelToFacetId?: (raw: string) => string | null; // optional: map "vegan" -> "diet-vegan"
  onPromoteFacetId?: (id: string) => void; // optional: add mapped id to the proper facet
};

const defaultReserved = [
    "diet-","meal-","course-","time-","dishtype-","method-","protein-",
    "difficulty-","appliance-","cuisine-","season-","occasion-","flavor-"
];

const slugify = (s: string) =>
  s.trim().toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export function CustomTagsInput({
    title = "Custom tags",
    value,
    onChange,
    placeholder = "Type and press Enter or comma…",
    maxTags = 10,
    reservedPrefixes = defaultReserved,
    tryPromoteLabelToFacetId,
    onPromoteFacetId,
    }: CustomTagsInputProps) {
    const [draft, setDraft] = useState("");
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const add = (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return;

        // Optional: promote to official facet
        if (tryPromoteLabelToFacetId) {
        const id = tryPromoteLabelToFacetId(trimmed);
        if (id) {
            onPromoteFacetId?.(id);
            setDraft(""); setError(null);
            return;
        }
        }

        const slug = slugify(trimmed);
        if (!slug) { setError("Tag is empty after normalization."); return; }
        if (reservedPrefixes.some(p => slug.startsWith(p))) {
            setError("That looks like a system tag. Use the pickers above.");
        return;
        }
        if (value.includes(slug)) { setError("Already added."); return; }
        if (value.length >= maxTags) { setError(`Up to ${maxTags} custom tags.`); return; }

        onChange([...value, slug]);
        setDraft(""); setError(null);
    };

    const remove = (slug: string) => {
        onChange(value.filter(v => v !== slug));
        setError(null);
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
        }
    };

    return (
        <div className={styles.customTags}>
            <span className={styles.customTagsTitle}>{title}</span>

            <div className={styles.customTagsWrap} onClick={() => inputRef.current?.focus()}>
                <div className={styles.customTagsChips}>
                    {value.map(slug => (
                        <Chip 
                            key={slug} 
                            label={slug} 
                            selected 
                            onRemove={() => remove(slug)} 
                        />
                    ))}
                </div>
                <input
                    ref={inputRef}
                    className={styles.customTagsInput}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    aria-invalid={!!error}
                />
            </div>

            {error && <FormMessage message={error} />}
        </div>
    );
}