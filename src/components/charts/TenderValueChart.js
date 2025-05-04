import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TenderValueChart = ({ data }) => {
  const defaultData = [
    { month: 'Jan', value: 150000, awarded: 120000 },
    { month: 'Feb', value: 200000, awarded: 180000 },
    { month: 'Mar', value: 300000, awarded: 250000 },
    { month: 'Apr', value: 180000, awarded: 150000 },
    { month: 'May', value: 250000, awarded: 220000 },
    { month: 'Jun', value: 320000, awarded: 280000 },
  ];

  const chartData = data || defaultData;

  // Format the value as currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-md rounded-md">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-gray-700 dark:text-gray-300" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tender Value Trends</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#9CA3AF" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'var(--chart-text-color, #374151)' }}
            style={{
              fontSize: '0.75rem',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)} 
            tick={{ fill: 'var(--chart-text-color, #374151)' }}
            style={{
              fontSize: '0.75rem',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => (
              <span className="text-gray-800 dark:text-gray-200">{value}</span>
            )}
          />
          <Bar name="Total Value" dataKey="value" fill="#6366F1" />
          <Bar name="Awarded Value" dataKey="awarded" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Add CSS variable for dark mode text color */}
      <style jsx="true">{`
        :root {
          --chart-text-color: #374151;
        }
        
        @media (prefers-color-scheme: dark) {
          :root {
            --chart-text-color: #E5E7EB;
          }
        }
        
        .dark {
          --chart-text-color: #E5E7EB;
        }
      `}</style>
    </div>
  );
};

export default TenderValueChart;
