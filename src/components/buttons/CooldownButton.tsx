import styles from './CooldownButton.module.css';
import { useEffect, useState } from "react";

interface CooldownButtonProps {
    onClick: () => void | Promise<void>;
    cooldownSeconds?: number;
    as?: "button" | "link";
    href?: string; // used if as="link"
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    showCountdown?: boolean;
}

export const CooldownButton: React.FC<CooldownButtonProps> = ({
        onClick,
        cooldownSeconds = 60,
        as = "button",
        href,
        children,
        className = "",
        disabled = false,
        showCountdown = true
    }) => {
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (cooldown > 0 || disabled) return;
        try {
            await onClick();
        } finally {
            setCooldown(cooldownSeconds);
        }
    };

    const isDisabled = disabled || cooldown > 0;

    const label = showCountdown && cooldown > 0
        ? `${children} (${cooldown})`
        : children;

    if (as === "link" && href) {
        return (
        <a
            href={isDisabled ? undefined : href}
            onClick={handleClick}
            className={styles.link}
            aria-disabled={isDisabled}
        >
            {label}
        </a>
        );
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isDisabled}
            className={styles.button}
        >
            {label}
        </button>
    );
};
