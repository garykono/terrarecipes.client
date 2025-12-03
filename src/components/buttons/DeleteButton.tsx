import styles from './Buttons.module.css';
import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';
import { GoXCircleFill } from 'react-icons/go';

interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    // Add any custom props specific to your component here, if needed
    iconClassName?: string;
    className?: string;
}

export default function DeleteButton({ iconClassName, className, ...rest }: CustomButtonProps) {
    return (
        <button { ...rest } className={clsx(className, styles.deleteButton)}>
            <GoXCircleFill className={clsx(iconClassName, styles.deleteButtonIcon)} />
        </button>
    )
}