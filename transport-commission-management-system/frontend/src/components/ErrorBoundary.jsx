import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an unhandled error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 shadow-md text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">Application Runtime Error</h2>
              <p className="text-xs text-slate-500">
                An unexpected error occurred while loading the application view.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-700 text-left overflow-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
