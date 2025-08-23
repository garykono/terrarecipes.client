import { Collection } from '../../api/types/collection';
import Card from '../card/Card';
import styles from './CollectionCard.module.css';

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
        <div className={`box ${styles.collectionCard} ${className}`}>
            <img className={styles.collectionImage} src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png" />
            <div className={`${styles.collectionInfo}`}>
                <p className={`subsection-title ${styles.collectionName}`}>{collection.name}</p>
                <p className={`text-meta ${styles.collectionMetaInfo}`}>{`📖 ${collection.recipes.length} recipes`}</p>
            </div>
        </div>



        // <Card
        //     title={collection.name}
        //     description={collection.description}
        //     metaDataItems={metaDataItems}
        //     size="lean"
        // />
    )
}