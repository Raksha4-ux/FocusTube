import React from 'react';
import { createRoot } from 'react-dom/client';
import AnalyticsDashboard from './AnalyticsDashboard';

const container = document.getElementById('analytics-root');

if (container) {
  const root = createRoot(container);
  root.render(<AnalyticsDashboard />);
} else {
  console.error('Container element not found');
}