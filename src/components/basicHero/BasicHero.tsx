import styles from './BasicHero.module.css';

type Align = 'start' | 'center' | 'end';

const alignMap: Record<Align, string> = {
  start: `${styles.itemsStart} ${styles.textLeft}`,
  center: `${styles.itemsCenter} ${styles.textCenter}`,
  end: `${styles.itemsEnd} ${styles.textRight}`,
};

interface BasicHeroProps {
    title: string;
    text?: string;
    variant?: 'banner' | 'underline';
    align?: Align;
    className?: string;
}

export default function BasicHero({ title, text, variant = 'banner', className } : BasicHeroProps) {
    // const alignCls = alignMap[align];

    if (variant === 'banner') {
        return (
            <header className={`${styles.bannerHero} ${className}`}>
                <div className={`container`}>
                    <h1 className={`page-title ${styles.heroTitle}`}>{title}</h1>
                    <p className={`${styles.heroText}`}>{text}</p>
                </div>
            </header>
        );
    } else {
        return (
            <header className={`${styles.underlineHero} ${className}`}>
                <div className={`container`}>
                    <h1 className={`page-title underlined-title category-color-standard`}>{title}</h1>
                </div>
            </header>
        )
    }
}