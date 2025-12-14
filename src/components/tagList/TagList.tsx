import styles from './TagList.module.css';
import { UseFieldArrayRemove } from 'react-hook-form';
import { GoXCircleFill } from 'react-icons/go';
import { shavePrefix } from '../../utils/tagHelpers';
import Chip from '../chip/Chip';

interface TagListProps {
    tags: string[];
}

export default function TagList({ tags }: TagListProps) {
    return (
        <div className={styles.tagList}>
            {tags.map((tag, index) => {

                return (
                    <Chip key={index}>
                        {shavePrefix(tag)}
                    </Chip>
                );
            })}
        </div>
    );
}

