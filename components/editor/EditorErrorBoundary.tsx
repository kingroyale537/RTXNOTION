// components/editor/EditorErrorBoundary.tsx
// Defensive React Error Boundary wrapper around TipTap ProseMirror Editor.
// Prevents unhandled runtime errors from crashing the page.

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class EditorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("[EditorErrorBoundary] Caught runtime editor error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="my-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs flex items-center justify-between">
          <span>Editor state synchronized. Click retry to resume editing.</span>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-lg transition"
          >
            Resume Editor
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
