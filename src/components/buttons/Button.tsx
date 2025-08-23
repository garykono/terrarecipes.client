import styles from './Buttons.module.css';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    // Add any custom props specific to your component here, if needed
    primary?: boolean;
    secondary?: boolean;
    danger?: boolean;
    className?: string;
}

export default function Button({ primary, secondary, danger, children, className, ...rest }: ButtonProps) {
    return (
        <button 
            { ...rest } 
            className={`
                button 
                ${primary && 'button--primary'} 
                ${secondary && 'button--secondary'}
                ${danger && 'button--danger'} 
                ${!(primary || danger) && 'button--secondary'}
                ${className}
            `}
        >
            {children}
        </button>
    )
}