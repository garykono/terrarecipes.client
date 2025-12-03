import { Link } from 'react-router';
import styles from './RelatedLinks.module.css'

interface RelatedLinksProps {
    links: {
        label: string;
        to: string;
    }[];
}

export default function RelatedLinks({ links}: RelatedLinksProps) {
    return (
        <div className={styles.relatedLinks}>
            <h2 className="section-title">Related:</h2>
            <ul className={styles.relatedLinksList}>
                {links.map(({ label, to }, index) => (
                    <li
                        key={index}
                        className={styles.link}
                    >
                        <Link to={to}>{label}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}