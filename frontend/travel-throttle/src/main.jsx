import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Error boundary for React
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (error.message && error.message.includes('disconnected port')) {
      // Ignore disconnected port errors
      return;
    }
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ display: 'none' }}>Error</div>;
    }
    return this.props.children;
  }
}

// Import React for ErrorBoundary
import React from 'react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)