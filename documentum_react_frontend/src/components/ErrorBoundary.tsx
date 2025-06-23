// ErrorBoundary.tsx
import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error in subtree:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <div>Oups, un problème est survenu.</div>;
    }
    return this.props.children;
  }
}
