// Analytics initialization script
// Load CSS dynamically
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = chrome.runtime.getURL('AnalyticsDashboard.css');
document.head.appendChild(link);

// Load the main script dynamically
const script = document.createElement('script');
script.src = chrome.runtime.getURL('dist/analytics-dashboard.js');
document.head.appendChild(script);