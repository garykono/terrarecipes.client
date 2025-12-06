import clsx from "clsx";
import { useState } from "react";
import styles from "./Footer.module.css";
import Modal from "../modal/Modal";
import Button from "../buttons/Button";
import { createFeedback } from "../../api/queries/feedbackApi";
import FormMessage from "../formMessage/FormMessage";

export default function Footer() {
    const [feedbackText, setFeedbackText] = useState<string>("");
    const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [feedbackSubmitError, setFeedbackSubmitError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedbackText.trim()) return;
            setSubmitting(true);
        try {
            await createFeedback(feedbackText)
                .then (() => {
                    setSubmitted(true);
                    setFeedbackText("");
                })
                .catch(e => {
                    if (e.details.invalidFields && e.details.invalidFields.length > 0 && e.details.invalidFields[0].message) {
                        setFeedbackSubmitError(e.details.invalidFields[0].message);
                    }
                })
        } catch (e) {
            
        }
        finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedbackText("");
        setShowFeedbackModal(false);
    };

    const onCloseFeedbackModal = () => {
        setShowFeedbackModal(false);
        setSubmitted(false);
    }

    const hasBeenSubmittedMessage =
        <p className={styles.hasBeenSubmittedMessage}>
            Your feedback has been submitted. Thank you!
        </p>

    const feedbackForm = 
        <form className="form">
            <div className="field">
                <label className="label">Please tell me what you think...</label>
                <textarea 
                    className="textarea" 
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                />
            </div>
            {feedbackSubmitError &&
                <FormMessage className="form-message" message={feedbackSubmitError} danger />
            }
            <div className={styles.feedbackModalButtons}>
                <div className={styles.modalButton}>
                    <Button secondary onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
                <div className={styles.modalButton}>
                    <Button primary onClick={handleSubmit}>
                        Submit
                    </Button>
                </div>
            </div>
        </form>

    const FeedbackModal = (
        <Modal 
            onClose={onCloseFeedbackModal} 
            windowTitle='Feedback'
            className={styles.feedbackModal}
        >
            {!submitted ? feedbackForm : hasBeenSubmittedMessage}
            
        </Modal>
    );

    return (
        <div className={styles.footer}>
            <p className={styles.mainFooterText}>© {new Date().getFullYear()} Terrarecipes · Built by Gary Kono</p>
            <nav className={styles.footerLinks}>
                <button className={styles.footerLink} onClick={() => setShowFeedbackModal(true)}>
                    Provide Feedback
                </button>
                <span className={styles.footerSeparator}>•</span>
                <a className={styles.footerLink} href="https://github.com/garykono/terrarecipes.client" target="_blank">
                    GitHub
                </a>
            </nav>
            {showFeedbackModal && FeedbackModal}
        </div>
    );
}