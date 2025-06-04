import styles from './BasicHero.module.css';
interface BasicHeroProps {
    title?: string;
    text?: string;
    className?: string;
}

export default function BasicHero({ title, text, className } : BasicHeroProps) {
    return (
        <div className={`${styles.hero} ${className}`}>
            <h1 className={`heading-primary ${styles.heroTitle}`}>{title}</h1>
            <p className={`${styles.heroText}`}>{text}</p>
        </div>
    );
}