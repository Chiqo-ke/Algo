import { Component, ErrorInfo, ReactNode } from "react";
import ErrorPage from "@/pages/ErrorPage";

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

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Intentionally silent in production - do not log stack traces to console.
    // Internal monitoring/telemetry can be wired here if needed.
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPage code="500" />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
