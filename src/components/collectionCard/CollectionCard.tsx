import clsx from 'clsx';
import styles from './CollectionCard.module.css';
import { Collection } from '../../api/types/collection';

interface CollectionCardProps {
    collection: Collection
    className?: string;
}

export default function CollectionCard({ collection, className }: CollectionCardProps) {
    const metaDataItems = [
        {
            icon: "📖",
            value: `${collection.recipes.length} recipes`
        }
    ]

    return (
        <div className={clsx(
            "box",
            styles.collectionCard,
            className
        )}>
            <img 
                className={styles.collectionImage} 
                src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png" 
            />
            <div className={styles.collectionInfo}>
                <p className={clsx(
                    "subsection-title",
                    styles.collectionName
                )}>
                    {collection.name}
                </p>
                <p className={clsx(
                    "text-meta",
                    styles.collectionMetaInfo
                )}>
                    {`📖 ${collection.recipes.length} recipes`}
                </p>
            </div>
        </div>
    )
}