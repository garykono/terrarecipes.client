import { GoXCircleFill } from 'react-icons/go';
import styles from './Buttons.module.css';
import { ButtonHTMLAttributes } from 'react';

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    // Add any custom props specific to your component here, if needed
    iconClassName?: string;
    className?: string;
}

export default function DeleteButton({ iconClassName, className, ...rest }: CustomButtonProps) {
    return (
        <button { ...rest } className={`${className} ${styles.deleteButton}`}>
            <GoXCircleFill className={`${iconClassName} ${styles.deleteButtonIcon}`} />
        </button>
    )
}