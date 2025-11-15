import { Component, ErrorInfo, ReactElement, ReactNode } from 'react';
import { log } from '../utils/logger';

export default class ErrorBoundary extends Component<{ fallback: ReactElement, children: ReactNode }, { hasError: boolean }> {
    constructor(props: { fallback: ReactElement, children: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        log.error('Top-level ErrorBoundary caught error', { error, info });
    }

    render() {
        if (this.state.hasError) {
            log.warn('got to top level error boundary')
            // You can render any custom fallback UI
            return this.props.fallback;
        }
        return this.props.children;
    }
}