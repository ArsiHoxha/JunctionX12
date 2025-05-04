import React from 'react';
import CountUp from 'react-countup';

const StatsCard = ({ title, value, icon, color, change, prefix = '', suffix = '' }) => {
  // Default values
  const displayValue = value || 0;
  const displayColor = color || 'primary';
  const displayChange = change || '+0%';
  
  // Define colors based on the color prop
  const getColorClasses = (colorName) => {
    switch (colorName) {
      case 'primary':
        return {
          bg: 'bg-indigo-500',
          light: 'bg-indigo-100 dark:bg-indigo-900/30',
          text: 'text-indigo-500 dark:text-indigo-400'
        };
      case 'success':
        return {
          bg: 'bg-emerald-500',
          light: 'bg-emerald-100 dark:bg-emerald-900/30',
          text: 'text-emerald-500 dark:text-emerald-400'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500',
          light: 'bg-amber-100 dark:bg-amber-900/30',
          text: 'text-amber-500 dark:text-amber-400'
        };
      case 'danger':
        return {
          bg: 'bg-rose-500',
          light: 'bg-rose-100 dark:bg-rose-900/30',
          text: 'text-rose-500 dark:text-rose-400'
        };
      case 'info':
        return {
          bg: 'bg-sky-500',
          light: 'bg-sky-100 dark:bg-sky-900/30',
          text: 'text-sky-500 dark:text-sky-400'
        };
      case 'purple':
        return {
          bg: 'bg-purple-500',
          light: 'bg-purple-100 dark:bg-purple-900/30',
          text: 'text-purple-500 dark:text-purple-400'
        };
      default:
        return {
          bg: 'bg-gray-500',
          light: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-500 dark:text-gray-400'
        };
    }
  };
  
  const colors = getColorClasses(displayColor);
  const isPositiveChange = displayChange.startsWith('+');
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/40 overflow-hidden">
      <div className={`h-1 ${colors.bg}`}></div>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <div className="mt-2 flex items-baseline">
              <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {prefix}
                <CountUp 
                  end={displayValue} 
                  duration={2.5} 
                  separator="," 
                  decimals={typeof displayValue === 'number' && displayValue % 1 !== 0 ? 2 : 0}
                />
                {suffix}
              </span>
              {displayChange !== '+0%' && (
                <span className={`ml-2 text-sm font-medium ${isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {displayChange}
                </span>
              )}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${colors.light}`}>
            {icon || (
              <svg className={`h-6 w-6 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 