import styles from './Buttons.module.css';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    // Add any custom props specific to your component here, if needed
    primary?: boolean;
    danger?: boolean;
    className?: string;
}

export default function Button({ primary, danger, children, className, ...rest }: ButtonProps) {
    return (
        <button 
            { ...rest } 
            className={`
                button 
                ${primary && 'button--full'} 
                ${danger && 'button--danger'} 
                ${className}
            `}
        >
            {children}
        </button>
    )
}