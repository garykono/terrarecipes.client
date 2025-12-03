import clsx from "clsx";
import React, { useState, useRef, useEffect } from "react";

type DropdownItem = {
    id: string | number;
    label: React.ReactNode;
    onClick: () => void;
};

type DropdownProps = {
    label: React.ReactNode;
    items: DropdownItem[];
    alignment?: "left" | "right";
    className?: string;
    triggerClassName?: string;
    noItemsMessage?: string;
};

export default function Dropdown({ 
    label, 
    items, 
    alignment = "left",
    className = "", 
    triggerClassName = "", 
    noItemsMessage = "" 
}: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown if clicked outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div 
            className={clsx(
                "dropdown",
                isOpen && "dropdown--is-active",
                className
            )} 
            ref={dropdownRef}
        >
            <div className="dropdown-trigger">
                <button
                    type="button"
                    className={triggerClassName}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((open) => !open)}
                >
                    <span>{label}</span>
                    <span aria-hidden="true" style={{ marginLeft: "0.5em" }}>⌄</span>
                </button>
            </div>

            {isOpen && (
                <div 
                    className={clsx(
                        "dropdown-menu",
                        alignment === "right" && "dropdown-menu--right"
                    )}  
                    role="listbox"
                >
                    <div className="dropdown-content">
                        {items.length > 0 ? (
                            items.map(({ id, label, onClick }) => (
                                <div
                                    key={id}
                                    className="dropdown-item"
                                    role="option"
                                    onClick={() => {
                                        onClick();
                                        setIsOpen(false);
                                    }}
                                >
                                {label}
                                </div>
                            ))
                        ) : (
                            <div className="dropdown-item">{noItemsMessage}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}