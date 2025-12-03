import { ReactNode } from 'react';
import { Link } from "react-router-dom";
import styles from './Toolbar.module.css';

export type ToolbarAction = 
        {
            label: string;
            icon?: ReactNode;
            to?: string;
            onClick?: () => void;
            dropdownElements?: ReactNode
        }
    | 
        {
            element: ReactNode;
        };

interface ToolbarProps {
    actions: ToolbarAction[];
}

export default function Toolbar({ actions }: ToolbarProps) {
    return (
        <div className={"toolbar"}>
            {actions.map((action, i) => {
                // If action is a custom element, render it directly
                if ("element" in action) {
                    return (
                        <div key={i} className={"toolbar--item"}>
                            {action.element}
                        </div>
                    );
                }

                // Otherwise, render as a standard link or button
                if (action.to) {
                    return (
                        <Link key={i} to={action.to} className={"toolbar--button"}>
                            {action.icon && <span className={"toolbar--icon"}>{action.icon}</span>}
                            {action.label}
                        </Link>
                    );
                }

                return (
                    <button
                        key={i}
                        onClick={action.onClick}
                        className={"toolbar--button"}
                    >
                        {action.icon && <span className={"toolbar--icon"}>{action.icon}</span>}
                        {action.label}
                    </button>
                );
            })}
        </div>
    );
}