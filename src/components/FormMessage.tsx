import classNames from "classnames"

interface FormMessageProps {
    message: string;
    success?: boolean;
    danger?: boolean;
    className?: string;
}

export default function FormMessage({ message, success, danger, className }: FormMessageProps) {
    const classes = classNames(
        className,
        'help', {
            'is-success': success,
            'is-danger': danger
        }
    )

    return (
        <p className={classes}>{message}</p>
    )
}