import { Link, useRouteError } from "react-router-dom";
import styles from './GlobalErrorDisplay.module.css';
import { isAppError } from '../../utils/errors/factory';
import { ERROR_CODE_MAP, HTTP_STATUS_TO_CODE } from '../../utils/errors/errorCodeMaps';
import { AppErrorCodes } from '../../utils/errors/codes';

function derive(error: unknown): { title: string; message: string } {
    if (!error) return { title: 'ERROR.', message: 'Something went wrong!' };

    if (isAppError(error)) {
        const statusCode = error.status && HTTP_STATUS_TO_CODE[error.status];
        const title = error.title 
            || ERROR_CODE_MAP[error.code]?.title 
            || (statusCode && error.status && ERROR_CODE_MAP[statusCode].title)
            || ERROR_CODE_MAP[AppErrorCodes.UNKNOWN].title;
        const message = error.message
            || ERROR_CODE_MAP[error.code]?.message
            || (statusCode && error.status && ERROR_CODE_MAP[statusCode].message)
            || ERROR_CODE_MAP[AppErrorCodes.UNKNOWN].message;

        return { title, message };
    }

    return { title: 'Error', message: 'Something went wrong!' };
}

interface GlobalErrorDisplayProps {
    error?: any;
    title?: string;
    message?: string;
}

export default function GlobalErrorDisplay({ error: propError, title, message }: GlobalErrorDisplayProps) {
    const routeError = useRouteError();
    const err = propError ?? routeError;

    const { title: dTitle, message: dMessage } = derive(err);
    const finalTitle = title ?? dTitle;
    const finalMessage = message ?? dMessage;

    return (
        <div className="page-top">
            <div className="container">
                <h2 className="page-title">{finalTitle}</h2>
                <p className="subsection-title">{finalMessage}</p>
                <div className={`subsection-title ${styles.homeLink}`}>
                    <Link to="/">Go Home</Link>
                </div>
            </div>
        </div>
    );
}