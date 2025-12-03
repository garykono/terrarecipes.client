import clsx from 'clsx';
import styles from './CardList.module.css';

interface CardListProps {
    list: React.ReactElement[];
    className?: string;
}

export default function CardList({ list, className }: CardListProps) {
    return (
        <div 
            className={clsx(
                styles.cardList,
                className
            )}
        >
                {list}
        </div>
    );
}