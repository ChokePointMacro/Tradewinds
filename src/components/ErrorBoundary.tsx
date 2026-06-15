import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render/effect errors in the subtree and shows a readable message
 * instead of unmounting the whole app to a blank white page. A single throw in
 * one tab (e.g. MapLibre failing when WebGL is unavailable) must not take down
 * the entire UI — wrap each tab so the header/nav survive and the user can
 * switch away. The error text is surfaced on-screen and to the console so the
 * actual cause is visible in production.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('Tradewinds error boundary caught:', error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm font-semibold text-slate-900">
          Something went wrong rendering this view.
        </p>
        <p className="max-w-md break-words text-xs text-slate-500">{error.message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
        >
          Reload
        </button>
      </div>
    );
  }
}
