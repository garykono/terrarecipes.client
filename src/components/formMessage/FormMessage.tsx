import styles from './FormMessage.module.css';
import classNames from "classnames"

interface FormMessageProps {
    message?: string;
    success?: boolean;
    danger?: boolean;
    className?: string;
}

export default function FormMessage({ 
    message = "An error occurred.", 
    success, 
    danger, 
    className 
}: FormMessageProps) {
    const classes = classNames(
        className,
        styles.message,
        success && styles.success,
        danger && styles.danger
    )

    return (
        <p className={classes}>{message}</p>
    )
}