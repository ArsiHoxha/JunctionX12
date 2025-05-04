import React, { useState, useEffect } from 'react';
import { generateTenderInsights } from '../../services/geminiService';

const TenderInsights = ({ tenders }) => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tenders || tenders.length === 0) {
      setIsLoading(false);
      return;
    }

    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        const data = await generateTenderInsights(tenders);
        setInsights(data);
      } catch (err) {
        console.error('Error getting tender insights:', err);
        setError('Failed to generate AI insights. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [tenders]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Error Loading Insights</h3>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No Insights Available</h3>
        <p className="text-gray-600 dark:text-gray-400">Add more tenders to generate AI insights.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white">AI Tender Insights</h3>
          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
            Powered by Gemini
          </span>
        </div>

        <div className="space-y-6">
          {/* Top Categories */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Top Tender Categories
            </h4>
            <div className="flex flex-wrap gap-2">
              {insights.topCategories?.map((category, index) => (
                <span 
                  key={index} 
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Average Budget */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Average Budget
            </h4>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">
              {insights.averageBudget}
            </p>
          </div>

          {/* Highest Interest */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Tenders with Highest Interest
            </h4>
            <ul className="space-y-1">
              {insights.highestInterest?.map((tender, index) => (
                <li 
                  key={index} 
                  className="text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {tender}
                </li>
              ))}
            </ul>
          </div>

          {/* Deadline Patterns */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Deadline Analysis
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {insights.deadlinePatterns}
            </p>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              AI Recommendations
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {insights.recommendations}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenderInsights; 