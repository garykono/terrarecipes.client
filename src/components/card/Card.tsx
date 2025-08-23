import styles from './Card.module.css';
import leanStyles from './CardLean.module.css';
import richStyles from './CardRich.module.css';

interface CardProps {
    title: string;
    headerSubTextIcon?: string;
    headerSubText?: string;
    description?: string;
    metaDataItems?: {
        icon: string;
        value: string;
    }[];
    image?: string;
    previewImages?: string[];
    previewMode?: boolean;
    size: "lean" | "rich";
    className?: string;
}

export default function Card({ 
    title, 
    headerSubTextIcon, 
    headerSubText, 
    image, 
    previewImages,
    previewMode = false,
    description, 
    metaDataItems, 
    size = "lean",
    className 
}: CardProps) {
    const imageContent = previewMode && previewImages
        ?   <div className={styles.previewImages}>
                {previewImages.slice(0, 4).map((image, index) => {
                    return <img key={index} className={styles.previewGridImage} src={image} />
                })}
            </div>
        :   <img 
                className={`${styles.img} ${size === 'rich' && richStyles.img}`}
                src={image? image : "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"}
            />

    return (
        <div className={`card ${styles.card} ${size === 'lean' ? leanStyles.card : richStyles.card } ${className}`}>
            {imageContent}
            <div className={`${styles.content} ${size === 'rich' && richStyles.recipeContent}`}>
                <div className={styles.mainText}>
                    <div className={styles.header}>
                        <p className={`${styles.title}`}>{title}</p>
                        {size === "rich" && (headerSubTextIcon || headerSubText) && 
                            <p className={styles.headerSecondary}>
                                <span className={styles.headerSecondaryIcon}>{`${headerSubTextIcon} `}</span>
                                <span className={styles.headerSecondaryText}>{headerSubText}</span>
                            </p>
                        }
                    </div>
                    <div className={styles.body}>
                        {size === 'rich' &&
                            <p className={`${styles.description}`}>{description}</p>
                        }
                    </div>
                </div>
                {metaDataItems && 
                    <ul className={`${styles.metaDataRow} ${size === 'rich' && styles.metaDivide}`}>
                        {metaDataItems.map((item, index) => (
                            <li key={index} className="text-meta"><span>{`${item.icon} ${item.value}`}</span></li>
                        ))}
                        {/* if more attributes causes this row to take 2 lines, make small adjustments like text size to 12px, shorter labels, etc.
                        <li className="text-meta"><span>🔥 Medium</span></li> */}
                    </ul>
                }
            </div>
        </div>
    )
}