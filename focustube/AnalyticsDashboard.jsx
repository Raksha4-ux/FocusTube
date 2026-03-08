import React, { useState, useEffect } from 'react';
import { Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Color palette
const COLORS = {
  primary: '#6366f1',
  secondary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  lime: '#84cc16',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.warning,
  COLORS.error,
  COLORS.info,
  COLORS.purple,
  COLORS.lime,
];

// Spectral color palette (similar to ColorBrewer Spectral)
const SPECTRAL_COLORS = [
  '#d53e4f', // Red
  '#f46d43', // Red-Orange
  '#fdae61', // Orange
  '#fee08b', // Yellow-Orange
  '#e6f598', // Yellow-Green
  '#abdda4', // Green
  '#66c2a5', // Blue-Green
  '#3288bd', // Blue
  '#5e4fa2', // Blue-Purple
];

// Generate N evenly spaced colors from spectral palette
function generateSpectralColors(n) {
  if (n <= 0) return [];

  const colors = [];
  for (let i = 0; i < n; i++) {
    // Map i from 0 to n-1 to an index in SPECTRAL_COLORS
    const index = Math.floor((i / (n - 1 || 1)) * (SPECTRAL_COLORS.length - 1));
    colors.push(SPECTRAL_COLORS[index]);
  }
  return colors;
}

const CATEGORY_COLORS = {
  productivity: COLORS.success,
  education: COLORS.secondary,
  programming: COLORS.purple,
  technology: COLORS.primary,
  ai: COLORS.purple,
  science: COLORS.lime,
  space: COLORS.info,
  finance: COLORS.info,
  entrepreneurship: COLORS.secondary,
  economics: COLORS.primary,
  health: COLORS.error,
  fitness: COLORS.error,
  nutrition: COLORS.error,
  selfcare: COLORS.warning,
  psychology: COLORS.warning,
  motivation: COLORS.warning,
  philosophy: COLORS.primary,
  history: COLORS.secondary,
  politics: COLORS.error,
  geopolitics: COLORS.error,
  news: COLORS.primary,
  documentary: COLORS.secondary,
  gaming: COLORS.warning,
  sports: COLORS.error,
  music: COLORS.purple,
  movies: COLORS.primary,
  entertainment: COLORS.warning,
  comedy: COLORS.warning,
  lifestyle: COLORS.success,
  travel: COLORS.success,
  food: COLORS.success,
  fashion: COLORS.warning,
  automotive: COLORS.secondary,
  design: COLORS.purple,
  art: COLORS.purple,
  photography: COLORS.purple,
  spirituality: COLORS.primary,
  relationships: COLORS.warning,
  parenting: COLORS.success,
  pets: COLORS.success,
  nature: COLORS.lime,
  other: COLORS.secondary,
};

function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const result = await chrome.storage.local.get('focusTubeAnalytics');
      const data = result.focusTubeAnalytics || {};
      setAnalyticsData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <DailyTimelineChart
        data={analyticsData}
        onDaySelect={setSelectedDay}
        formatDuration={formatDuration}
      />
      <div className="dashboard-grid">
        <SelectedDayBreakdownChart
          data={analyticsData}
          selectedDay={selectedDay}
          formatDuration={formatDuration}
        />
        <ThirtyDayAverageChart
          data={analyticsData}
          formatDuration={formatDuration}
        />
      </div>
      <DailyTable
        data={analyticsData}
        formatDuration={formatDuration}
      />
    </DashboardLayout>
  );
}

function DashboardLayout({ children }) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" x2="18" y1="20" y2="10"/>
                <line x1="12" x2="12" y1="20" y2="4"/>
                <line x1="6" x2="6" y1="20" y2="14"/>
              </svg>
            </span>
            FocusTube Analytics Dashboard
          </h1>
          <p className="dashboard-subtitle">Track your YouTube viewing habits and stay focused</p>
        </div>
      </header>
      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
}

function DailyTimelineChart({ data, onDaySelect, formatDuration }) {
  const dates = Object.keys(data).sort();
  const chartData = {
    labels: dates.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Minutes Watched',
      data: dates.map(date => {
        const dayData = data[date];
        const totalSeconds = Object.values(dayData).reduce((sum, seconds) => sum + (typeof seconds === 'number' ? seconds : 0), 0);
        return totalSeconds / 60;
      }),
      borderColor: COLORS.primary,
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: COLORS.primary,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#e5e7eb',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) => `Total: ${formatDuration(context.parsed.y * 60)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.3)',
        },
        ticks: {
          color: '#6b7280',
          callback: (value) => `${value}m`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const selectedDate = dates[index];
        onDaySelect(selectedDate);
      }
    },
  };

  return (
    <section className="section">
      <div className="card">
        <h2 className="section-title">
          <span className="icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
          </span>
          Daily Usage Timeline (Last 30 Days)
        </h2>
        <div className="chart-container timeline-chart">
          <Line data={chartData} options={options} />
        </div>
      </div>
    </section>
  );
}

function SelectedDayBreakdownChart({ data, selectedDay, formatDuration }) {
  let chartData = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderWidth: 2,
      borderColor: '#ffffff',
    }],
  };

  let displayText = 'Click a bar above to see details';

  if (selectedDay && data[selectedDay]) {
    const dayData = data[selectedDay];
    const categories = Object.entries(dayData)
      .filter(([_, seconds]) => seconds > 0)
      .sort(([,a], [,b]) => b - a);

    chartData = {
      labels: categories.map(([cat]) => cat.charAt(0).toUpperCase() + cat.slice(1)),
      datasets: [{
        data: categories.map(([, seconds]) => seconds),
        backgroundColor: generateSpectralColors(categories.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      }],
    };

    displayText = `Breakdown for ${new Date(selectedDay).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })}`;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#6b7280',
          padding: 16,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#e5e7eb',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const item = chartData.labels[context.dataIndex];
            const value = context.parsed;
            return `${item}: ${formatDuration(value)}`;
          },
        },
      },
    },
  };

  return (
    <div className="card chart-card">
      <h2 className="section-title">
        <span className="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
            <path d="M22 12A10 10 0 0 0 12 2v10z"/>
          </svg>
        </span>
        Selected Day Breakdown
      </h2>
      <p className="chart-description">{displayText}</p>
      <div className="chart-container">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}

function ThirtyDayAverageChart({ data, formatDuration }) {
  const dates = Object.keys(data);
  const categoryTotals = {};

  // Calculate totals across all days
  dates.forEach(date => {
    const dayData = data[date];
    Object.entries(dayData).forEach(([category, seconds]) => {
      categoryTotals[category] = (categoryTotals[category] || 0) + seconds;
    });
  });

  const categories = Object.entries(categoryTotals)
    .filter(([, seconds]) => seconds > 0)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8); // Top 8 categories

  const chartData = {
    labels: categories.map(([cat]) => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [{
      data: categories.map(([, seconds]) => seconds),
      backgroundColor: generateSpectralColors(categories.length),
      borderWidth: 2,
      borderColor: '#ffffff',
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#6b7280',
          padding: 16,
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#e5e7eb',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const item = chartData.labels[context.dataIndex];
            const value = context.parsed;
            return `${item}: ${formatDuration(value)}`;
          },
        },
      },
    },
  };

  return (
    <div className="card chart-card">
      <h2 className="section-title">
        <span className="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
            <path d="M22 12A10 10 0 0 0 12 2v10z"/>
          </svg>
        </span>
        30 Day Average Distribution
      </h2>
      <div className="chart-container">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}

function DailyTable({ data, formatDuration }) {
  const [filterDays, setFilterDays] = useState(null);
  const [sortBy, setSortBy] = useState('date-desc');

  let dates = Object.keys(data);

  // Apply date filter
  if (filterDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filterDays);
    dates = dates.filter(date => new Date(date) >= cutoffDate);
  }

  // Apply sorting
  dates.sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a) - new Date(b);
      case 'date-desc':
        return new Date(b) - new Date(a);
      case 'time-asc':
        const totalA = Object.values(data[a]).reduce((sum, seconds) => sum + (typeof seconds === 'number' ? seconds : 0), 0);
        const totalB = Object.values(data[b]).reduce((sum, seconds) => sum + (typeof seconds === 'number' ? seconds : 0), 0);
        return totalA - totalB;
      case 'time-desc':
        const totalA2 = Object.values(data[a]).reduce((sum, seconds) => sum + (typeof seconds === 'number' ? seconds : 0), 0);
        const totalB2 = Object.values(data[b]).reduce((sum, seconds) => sum + (typeof seconds === 'number' ? seconds : 0), 0);
        return totalB2 - totalA2;
      default:
        return new Date(b) - new Date(a);
    }
  });

  const rows = dates.map(date => {
    const dayData = data[date];
    const totalSeconds = Object.values(dayData).reduce((sum, seconds) => sum + (typeof seconds === 'number' ? seconds : 0), 0);
    const totalTime = formatDuration(totalSeconds);

    // Find top category
    let topCategory = 'None';
    let maxSeconds = 0;
    Object.entries(dayData).forEach(([cat, seconds]) => {
      if (seconds > maxSeconds) {
        maxSeconds = seconds;
        topCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
      }
    });

    return {
      date: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      totalTime,
      topCategory,
    };
  });

  return (
    <section className="section">
      <div className="card">
        <div className="table-header">
          <h2 className="section-title">
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v18"/>
                <path d="M3 6h18"/>
                <path d="M3 12h18"/>
                <path d="M3 18h18"/>
              </svg>
            </span>
            Daily Table
          </h2>
          <div className="table-controls">
            <label className="control-label">Display:</label>
            <select
              className="table-dropdown"
              value={filterDays === 7 ? '7days' : filterDays === 30 ? '30days' : 'all'}
              onChange={(e) => {
                const value = e.target.value;
                setFilterDays(value === '7days' ? 7 : value === '30days' ? 30 : null);
              }}
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
            <label className="control-label">Sort by:</label>
            <select
              className="table-dropdown"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Date (Newest First)</option>
              <option value="date-asc">Date (Oldest First)</option>
              <option value="time-desc">Time (Highest First)</option>
              <option value="time-asc">Time (Lowest First)</option>
            </select>
          </div>
        </div>
        <div className="table-container">
          <table className="daily-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Time</th>
                <th>Top Category</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>{row.date}</td>
                  <td>{row.totalTime}</td>
                  <td>{row.topCategory}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AnalyticsDashboard;