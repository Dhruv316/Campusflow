import { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => this.setState({ hasError: false, error: null });

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (!hasError) return children;
    if (Fallback) return <Fallback error={error} onRetry={this.handleRetry} />;

    const isDev = import.meta.env?.DEV;

    return (
      <div className="min-h-screen flex items-center justify-center bg-ink p-6">
        <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 text-center shadow-card">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-pink/10 border border-pink/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-pink" />
          </div>
          <h2 className="text-display text-3xl text-white tracking-[2px] mb-2">
            SOMETHING WENT WRONG
          </h2>
          <p className="text-sm text-muted mb-5">
            An unexpected error occurred while rendering this page.
          </p>
          {isDev && error && (
            <pre className="text-left text-xs bg-raised border border-border rounded-lg p-3 mb-5 overflow-auto max-h-32 text-pink whitespace-pre-wrap break-words font-mono">
              {error.message}
            </pre>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-lime text-ink font-bold uppercase text-sm tracking-[1px] rounded-full hover:shadow-lime transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-border text-secondary font-bold uppercase text-sm tracking-[1px] rounded-full hover:border-lime hover:text-lime transition-all"
            >
              <Home className="w-4 h-4" />
              Go Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
