import styles from './TagList.module.css';
import { GoXCircleFill } from 'react-icons/go';
import { UseFieldArrayRemove } from "react-hook-form";

interface TagListProps {
    tags: string[];
    onDelete?: (index: number) => void | UseFieldArrayRemove;
}

export default function TagList({ tags, onDelete }: TagListProps) {
    return (
        <div className={styles.tagList}>
            {tags.map((tag, index) => {
                return (
                    <span className={styles.tag} key={index}>
                        {tag}
                        {onDelete && 
                            <button className={styles.deleteButton} type="button" onClick={() => onDelete(index)}>
                                <GoXCircleFill />
                            </button>
                        }
                    </span>
                );
            })}
        </div>
    );
}