import { Component, ErrorInfo, ReactNode } from "react";
import ErrorPage from "@/pages/ErrorPage";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught React error:', error);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
    // Route through logger → Vercel Analytics track() + Django backend POST
    logger.ui.error(`React crash: ${error.message}`, error, {
      componentStack: info.componentStack ?? '',
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage code="500" />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
