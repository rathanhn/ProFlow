'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import ErrorReportButton from './ErrorReportButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      errorId: Date.now().toString()
    });

    // In a real app, you would send this to your error reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Store error in localStorage for admin panel (in real app, send to backend)
    try {
      const errorReport = {
        id: this.state.errorId || Date.now().toString(),
        type: 'crash',
        title: `Application Crash: ${error.name}`,
        description: error.message,
        category: 'crash',
        priority: 'high' as const,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        submittedBy: 'System',
        userType: 'system' as const,
        errorStack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      const existingReports = JSON.parse(localStorage.getItem('errorReports') || '[]');
      existingReports.push(errorReport);
      localStorage.setItem('errorReports', JSON.stringify(existingReports));
    } catch (storageError) {
      console.error('Failed to store error report:', storageError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  handleGoHome = () => {
    window.location.href = '/admin';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-6 w-6" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  We're sorry, but something unexpected happened. The error has been automatically 
                  reported to our team, but you can also provide additional details to help us fix it faster.
                </p>

                {this.props.showErrorDetails && this.state.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Error Details:</h4>
                    <div className="text-sm text-red-700 space-y-2">
                      <p><strong>Error:</strong> {this.state.error.name}</p>
                      <p><strong>Message:</strong> {this.state.error.message}</p>
                      {this.state.error.stack && (
                        <details className="mt-2">
                          <summary className="cursor-pointer font-medium">Stack Trace</summary>
                          <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                            {this.state.error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">What you can do:</h4>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Try refreshing the page</li>
                    <li>Go back to the home page</li>
                    <li>Report additional details about what you were doing</li>
                    <li>Contact support if the problem persists</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
                <ErrorReportButton
                  variant="outline"
                  size="default"
                  className="flex-1"
                  errorContext={{
                    page: window.location.pathname,
                    component: 'ErrorBoundary',
                    action: 'Component Crash',
                    errorMessage: this.state.error?.message
                  }}
                />
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Error ID: {this.state.errorId} • {new Date().toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
