import React from 'react';

const AIProposalAnalysis = ({ tender, proposals, onClose, onAnalysisComplete, analysisResult }) => {
  // No need for loading state or to fetch analysis since it's passed as a prop
  
  // Handle error case
  if (analysisResult?.error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-5xl mx-auto">
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-300 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Analysis Error</h2>
          <p className="text-gray-600 dark:text-gray-300">{analysisResult.error}</p>
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-primary text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Handle case when there's no analysis result
  if (!analysisResult) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-5xl mx-auto">
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300">No analysis could be generated.</p>
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-primary text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Handle case when analysis result is not in expected format
  if (!analysisResult.recommendation || !analysisResult.analysis) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-5xl mx-auto">
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300">The AI generated a response but it was not in the expected format.</p>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md text-left overflow-auto max-h-96">
            <pre className="text-xs text-gray-600 dark:text-gray-300">
              {JSON.stringify(analysisResult, null, 2)}
            </pre>
          </div>
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-primary text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-5xl mx-auto overflow-auto">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Proposal Analysis</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Recommendation section */}
      <div className="mb-8">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3">
            Recommended Proposal
          </h3>
          {analysisResult.recommendation.proposalId ? (
            <div>
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {analysisResult.recommendation.title || `Proposal #${analysisResult.recommendation.proposalId}`}
                  </p>
                </div>
              </div>
              
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Why this proposal stands out:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {analysisResult.recommendation.reasons?.map((reason, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No clear recommendation could be made.</p>
          )}
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Summary
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {analysisResult.summary || "No summary provided."}
          </p>
        </div>
      </div>

      {/* Detailed analysis */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Detailed Analysis
        </h3>

        {analysisResult.analysis && analysisResult.analysis.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisResult.analysis.map((item, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 ${
                  analysisResult.recommendation.proposalId === item.proposalId
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-base font-medium text-gray-900 dark:text-white">
                    {item.title || `Proposal #${item.proposalId}`}
                  </h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium 
                    ${parseInt(item.score) >= 80 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : parseInt(item.score) >= 60 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    Score: {item.score}/100
                  </div>
                </div>

                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strengths:</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {item.strengths?.map((strength, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">{strength}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weaknesses:</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {item.weaknesses?.map((weakness, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400">{weakness}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center mt-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Value for Money:</span>
                  <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {item.valueForMoney}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No detailed analysis available.</p>
        )}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Close Analysis
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This analysis was generated by Google's Gemini 1.5 Flash AI and should be used as an additional tool alongside human judgment.
        </p>
      </div>
    </div>
  );
};

export default AIProposalAnalysis; 