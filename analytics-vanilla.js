const ANALYTICS_STORAGE_KEY = "focusTubeAnalytics";

const ANALYTICS_CATEGORIES_ORDER = [
  "productivity",
  "education",
  "programming",
  "technology",
  "ai",
  "science",
  "space",
  "finance",
  "entrepreneurship",
  "economics",
  "health",
  "fitness",
  "nutrition",
  "selfcare",
  "psychology",
  "motivation",
  "philosophy",
  "history",
  "politics",
  "geopolitics",
  "news",
  "documentary",
  "gaming",
  "sports",
  "music",
  "movies",
  "entertainment",
  "comedy",
  "lifestyle",
  "travel",
  "food",
  "fashion",
  "automotive",
  "design",
  "art",
  "photography",
  "spirituality",
  "relationships",
  "parenting",
  "pets",
  "nature",
  "other"
];

const CATEGORY_COLORS = {
  productivity: '#22c55e',
  education: '#3b82f6',
  programming: '#7c3aed',
  technology: '#8b5cf6',
  ai: '#a855f7',
  science: '#84cc16',
  space: '#06b6d4',
  finance: '#0ea5e9',
  entrepreneurship: '#0284c7',
  economics: '#0369a1',
  health: '#ef4444',
  fitness: '#dc2626',
  nutrition: '#b91c1c',
  selfcare: '#ec4899',
  psychology: '#db2777',
  motivation: '#f59e0b',
  philosophy: '#d97706',
  history: '#ea580c',
  politics: '#dc2626',
  geopolitics: '#b91c1c',
  news: '#6366f1',
  documentary: '#4f46e5',
  gaming: '#f97316',
  sports: '#ea580c',
  music: '#8b5cf6',
  movies: '#7c3aed',
  entertainment: '#eab308',
  comedy: '#ca8a04',
  lifestyle: '#f59e0b',
  travel: '#10b981',
  food: '#059669',
  fashion: '#ec4899',
  automotive: '#6b7280',
  design: '#8b5cf6',
  art: '#a855f7',
  photography: '#7c3aed',
  spirituality: '#db2777',
  relationships: '#ec4899',
  parenting: '#f97316',
  pets: '#10b981',
  nature: '#22d3ee',
  other: '#6b7280'
};

let dailyData = {};
let categoryTotals = {};
let selectedDay = null;

// Format seconds to readable time
function formatDuration(seconds) {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Get last 30 days including today
function getLast30Days() {
  const dates = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    dates.push(date.toISOString().slice(0, 10));
  }
  return dates;
}

// Load and process analytics data
function loadAnalyticsData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(ANALYTICS_STORAGE_KEY, (data) => {
      const analytics = data[ANALYTICS_STORAGE_KEY] || {};
      const last30Days = getLast30Days();

      dailyData = {};
      categoryTotals = {};

      last30Days.forEach(date => {
        const dayData = analytics[date] || {};
        let totalSeconds = 0;

        ANALYTICS_CATEGORIES_ORDER.forEach(category => {
          const seconds = dayData[category] || 0;
          totalSeconds += seconds;
          categoryTotals[category] = (categoryTotals[category] || 0) + seconds;
        });

        dailyData[date] = {
          total: totalSeconds,
          breakdown: dayData
        };
      });

      resolve();
    });
  });
}

// Create daily timeline bar chart
function createDailyTimelineChart() {
  const canvas = document.getElementById('daily-timeline-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const dates = Object.keys(dailyData);
  if (dates.length === 0) return;
  
  const totals = dates.map(date => dailyData[date].total / 60); // Convert to minutes

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Minutes Watched',
        data: totals,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: 'rgba(59, 130, 246, 1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#e5e7eb',
          bodyColor: '#9ca3af',
          borderColor: '#1f2937',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return `Total: ${formatDuration(context.parsed.y * 60)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(31, 41, 55, 0.5)',
            borderColor: '#1f2937'
          },
          ticks: {
            color: '#9ca3af',
            callback: function(value) {
              return formatDuration(value * 60);
            },
            color: '#9ca3af'
          },
          grid: {
            color: '#1f2937'
          }
        },
        x: {
          ticks: {
            color: '#9ca3af'
          },
          grid: {
            color: '#1f2937'
          }
        }
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const date = dates[index];
          selectDay(date);
        }
      }
    }
  });
}

// Create category distribution donut chart
function createCategoryDistributionChart() {
  const canvas = document.getElementById('category-distribution-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const totalSeconds = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
  if (totalSeconds === 0) return;

  const data = ANALYTICS_CATEGORIES_ORDER
    .filter(cat => categoryTotals[cat] > 0)
    .map(cat => ({
      category: cat,
      seconds: categoryTotals[cat],
      percentage: (categoryTotals[cat] / totalSeconds * 100).toFixed(1)
    }));

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(item => item.category.charAt(0).toUpperCase() + item.category.slice(1)),
      datasets: [{
        data: data.map(item => item.seconds),
        backgroundColor: data.map(item => CATEGORY_COLORS[item.category] || '#6b7280'),
        borderWidth: 2,
        borderColor: '#0f172a',
        hoverBorderColor: '#1f2937'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#9ca3af',
            padding: 16,
            font: {
              size: 12
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#e5e7eb',
          bodyColor: '#9ca3af',
          borderColor: '#1f2937',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const item = data[context.dataIndex];
              return `${item.category.charAt(0).toUpperCase() + item.category.slice(1)}: ${formatDuration(item.seconds)} (${item.percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Select a day and update pie chart
function selectDay(date) {
  selectedDay = date;
  const dayData = dailyData[date];
  document.getElementById('selected-day').textContent = `Breakdown for ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`;

  const canvas = document.getElementById('day-breakdown-chart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (window.dayBreakdownChart) {
    window.dayBreakdownChart.destroy();
  }

  const data = ANALYTICS_CATEGORIES_ORDER
    .filter(cat => dayData.breakdown[cat] > 0)
    .map(cat => ({
      category: cat,
      seconds: dayData.breakdown[cat]
    }));

  if (data.length === 0) {
    document.getElementById('selected-day').textContent += ' (No data)';
    return;
  }

  window.dayBreakdownChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.map(item => item.category.charAt(0).toUpperCase() + item.category.slice(1)),
      datasets: [{
        data: data.map(item => item.seconds),
        backgroundColor: data.map(item => CATEGORY_COLORS[item.category] || '#6b7280'),
        borderWidth: 2,
        borderColor: '#0f172a',
        hoverBorderColor: '#1f2937'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#9ca3af',
            padding: 16,
            font: {
              size: 12
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#e5e7eb',
          bodyColor: '#9ca3af',
          borderColor: '#1f2937',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const item = data[context.dataIndex];
              return `${item.category.charAt(0).toUpperCase() + item.category.slice(1)}: ${formatDuration(item.seconds)}`;
            }
          }
        }
      }
    }
  });
}

// Populate daily table
function populateDailyTable(filterDays = null, sortBy = 'date-desc') {
  const tbody = document.querySelector('#daily-table tbody');
  tbody.innerHTML = '';

  let dates = Object.keys(dailyData);

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
        return dailyData[a].total - dailyData[b].total;
      case 'time-desc':
        return dailyData[b].total - dailyData[a].total;
      default:
        return new Date(b) - new Date(a); // Default: newest first
    }
  });

  dates.forEach(date => {
    const dayData = dailyData[date];
    const totalTime = formatDuration(dayData.total);

    // Find top category
    let topCategory = 'None';
    let maxSeconds = 0;
    for (const [cat, seconds] of Object.entries(dayData.breakdown)) {
      if (seconds > maxSeconds) {
        maxSeconds = seconds;
        topCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
      }
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      <td>${totalTime}</td>
      <td>${topCategory}</td>
    `;
    tbody.appendChild(row);
  });
}

// Initialize table controls
function initializeTableControls() {
  const filterDropdown = document.getElementById('table-filter');
  const sortDropdown = document.getElementById('table-sort');

  if (!filterDropdown || !sortDropdown) return;

  // Set initial values
  filterDropdown.value = 'all';
  sortDropdown.value = 'date-desc';

  // Add event listeners
  filterDropdown.addEventListener('change', updateTableDisplay);
  sortDropdown.addEventListener('change', updateTableDisplay);
}

function updateTableDisplay() {
  const filterDropdown = document.getElementById('table-filter');
  const sortDropdown = document.getElementById('table-sort');

  if (!filterDropdown || !sortDropdown) return;

  const filterValue = filterDropdown.value;
  const sortValue = sortDropdown.value;

  // Convert filter value to days
  let filterDays = null;
  if (filterValue === '7days') {
    filterDays = 7;
  } else if (filterValue === '30days') {
    filterDays = 30;
  }

  populateDailyTable(filterDays, sortValue);
}

// Generate and download CSV file
function downloadCSV() {
  const dates = Object.keys(dailyData).sort(); // Chronological order
  let csvContent = 'date,category,time\n';

  dates.forEach(date => {
    const dayData = dailyData[date];
    const breakdown = dayData.breakdown;

    for (const [category, seconds] of Object.entries(breakdown)) {
      if (seconds > 0) {
        const minutes = Math.floor(seconds / 60);
        const dateStr = new Date(date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        });
        csvContent += `${dateStr},${category},${minutes}\n`;
      }
    }
  });

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `FocusTube-Analytics-${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Initialize dashboard
async function initDashboard() {
  try {
    await loadAnalyticsData();
    createDailyTimelineChart();
    createCategoryDistributionChart();
    populateDailyTable();
    initializeTableControls();

    // Set up CSV download button
    const downloadBtn = document.getElementById('download-csv-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', downloadCSV);
    }
  } catch (error) {
    console.error('Error initializing analytics dashboard:', error);
  }
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);