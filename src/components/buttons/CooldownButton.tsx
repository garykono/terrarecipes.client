import Button from './Button';
import styles from './CooldownButton.module.css';
import { useEffect, useState } from "react";

interface CooldownButtonProps {
    onClick: () => void | Promise<void>;
    cooldownSeconds?: number;
    children: React.ReactNode;
    disabled?: boolean;
    showCountdown?: boolean;
    className?: string;
}

export const CooldownButton: React.FC<CooldownButtonProps> = ({
        onClick,
        cooldownSeconds = 0,
        children,
        disabled = false,
        showCountdown = true,
        className = "",
        ...rest
    }) => {
    const [cooldown, setCooldown] = useState(0);

    // sync external cooldownSeconds into internal state
    useEffect(() => {
        if (cooldownSeconds && cooldownSeconds > 0) {
            setCooldown(cooldownSeconds);
        }
    }, [cooldownSeconds]);

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

    return (
        <Button
            primary
            type="button"
            onClick={handleClick}
            disabled={isDisabled}
            className={className}
            {...rest}
        >
            <div className={styles.cooldownButtonDisplay}>
                {children}
                {(!disabled && showCountdown && cooldown > 0) &&
                    <span>{` (${cooldown})`}</span>
                }
            </div>
        </Button>
    );
};
