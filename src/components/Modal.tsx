import { ReactNode } from "react";

interface ModalProps {
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    submitButtonText: string;
    success?: boolean;
    danger?: boolean;
    children: ReactNode;
}

export default function Modal({ onClose, onConfirm, title, submitButtonText, success, danger, children }: ModalProps) {
    const headingColor = success? 'my-color-bg' : 'has-background-danger';
    const buttonColor = success? 'my-color-bg' : 'is-danger';

    return (
        <div className={"modal is-active"}>
            <div className="modal-background" onClick={onClose} />
            
            <div className="modal-card">
                <header className={`modal-card-head ${headingColor}`}>
                    <p className={`modal-card-title ${success && 'has-text-white'}`}>{title}</p>
                    <button
                        onClick={onClose}
                        className="delete"
                        aria-label="close"
                    />
                </header>
                <section className="modal-card-body">
                    {children}
                </section>
                <footer className="modal-card-foot">
                    <div className="buttons">
                        <button onClick={onClose} type="button" className="button">Cancel</button>
                        <button onClick={onConfirm} type="submit" className={`button ${buttonColor}`} >{submitButtonText}</button>
                    </div>
                </footer>
            </div>
        </div>
    );
}