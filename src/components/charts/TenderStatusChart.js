import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const TenderStatusChart = ({ data }) => {
  const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EF4444'];
  const defaultData = [
    { name: 'Open', value: 12 },
    { name: 'Draft', value: 5 },
    { name: 'Under Review', value: 8 },
    { name: 'Closed', value: 10 }
  ];

  const chartData = data || defaultData;

  // Custom tooltip component that supports dark mode
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-md rounded-md">
          <p className="font-medium text-gray-900 dark:text-white">{payload[0].name}</p>
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">{payload[0].value}</span> Tenders
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tender Status Distribution</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            formatter={(value) => (
              <span className="text-gray-800 dark:text-gray-200">{value}</span>
            )}
          />
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TenderStatusChart; 