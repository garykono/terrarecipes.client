import styles from './Modal.module.css';
import ReactDOM from 'react-dom'
import { useEffect } from 'react'
import { ReactNode } from "react";
import GlobalErrorDisplay from '../GlobalErrorDisplay';
import DeleteButton from '../buttons/DeleteButton';

interface ModalProps {
    onClose: () => void;
    windowTitle: string;
    danger?: boolean;
    className?: string;
    children: ReactNode;
}

export default function Modal({ onClose, windowTitle, danger, className, children }: ModalProps) {
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'visible';
        }
    })

    const portalRoot = document.querySelector('.modal-container');

    if (!portalRoot) {
        // console.log("The modal could not be opened because a reference to the modal container in index.html could not be created.")
        return <GlobalErrorDisplay />
    }

    return (
        ReactDOM.createPortal(
                <div className={`${styles.modal} ${className}`} >
                    <div className={styles.modalBackground} onClick={onClose} />
                    <div className={styles.modalCard}>
                        <header className={`${styles.modalHead} ${danger && styles.danger}`}>
                            <h1 className={`${styles.modalCardTitle} ${danger && 'has-text-white'} heading-tertiary`}>{windowTitle}</h1>
                            <DeleteButton
                                onClick={onClose}
                                className={styles.closeButton}
                                aria-label="close"
                            />
                        </header>
                        <div className={styles.modalCardContent}>
                            {children}
                        </div>
                    </div>
                </div>,
            portalRoot
        )
    )
}