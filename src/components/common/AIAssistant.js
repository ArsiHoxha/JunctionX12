import React, { useState, useRef, useEffect } from 'react';
import { analyzeTender, answerGeneralTenderQuestion } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';

// Helper function to add better formatting to AI responses
const formatAIResponse = (response) => {
  // Structure responses by adding markdown if not already formatted
  if (!response.includes('#') && !response.includes('*') && response.length > 100) {
    // Identify potential sections to format
    let formatted = response;
    
    // Add headings to key sections if they exist in the text
    const potentialSections = [
      { pattern: /requirements/i, heading: "## Requirements" },
      { pattern: /analysis/i, heading: "## Analysis" },
      { pattern: /evaluation criteria/i, heading: "## Evaluation Criteria" },
      { pattern: /risks|risk factors/i, heading: "## Risk Assessment" },
      { pattern: /budget|financial/i, heading: "## Budget Analysis" },
      { pattern: /conclusion|summary/i, heading: "## Summary" },
      { pattern: /recommendations/i, heading: "## Recommendations" },
      { pattern: /eligibility|qualification/i, heading: "## Eligibility Criteria" },
      { pattern: /deadlines|timeline/i, heading: "## Timeline" },
      { pattern: /scope of work|scope/i, heading: "## Scope of Work" }
    ];
    
    // Try to identify sections and format them
    potentialSections.forEach(section => {
      if (section.pattern.test(formatted)) {
        formatted = formatted.replace(
          new RegExp(`(\\.|\\n)(\\s*)${section.pattern.source}`, 'i'),
          `.\n\n${section.heading}\n`
        );
      }
    });
    
    // Add bullet points to lists (sentences that start with numbers followed by period or parenthesis)
    formatted = formatted.replace(/(\n|^)\s*(\d+[\).:])\s*/g, '\n* ');
    
    // Add bullet points to items that might be requirements or key points
    const bulletPointIndicators = [
      'must', 'should', 'required', 'necessary', 'important', 
      'critical', 'key', 'essential', 'crucial', 'mandatory'
    ];
    
    bulletPointIndicators.forEach(indicator => {
      const pattern = new RegExp(`(\\.|\\n)(\\s*)(.*?${indicator}.*?)(\\.|\\n)`, 'gi');
      formatted = formatted.replace(pattern, (match, p1, p2, content, p4) => {
        if (p1 === '\n' || p2.includes('\n')) return match;
        return `${p1}\n* ${content}${p4}`;
      });
    });
    
    // Add bold to important items
    formatted = formatted.replace(/(^|\n|\s)(important|critical|key|required|mandatory|must|necessary)(\s|:)/gi, '$1**$2**$3');
    
    // If no sections were identified, add a default one
    if (!formatted.includes('##')) {
      formatted = `## Key Information\n${formatted}`;
    }
    
    // Ensure proper spacing between sections
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    return formatted;
  }
  
  return response;
};

// Component to render AI messages with formatting
const FormattedMessage = ({ content }) => {
  // Split content into sections based on h2 headings
  const sections = content.split(/(?=## )/);
  
  const renderBulletPoint = (props) => {
    return (
      <li className="my-1 flex items-start" {...props}>
        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light mr-2 flex-shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
        <span>{props.children}</span>
      </li>
    );
  };
  
  if (sections.length > 1) {
    return (
      <div className="space-y-3">
        {sections.map((section, idx) => {
          if (!section.trim()) return null;
          
          // Extract heading from section (if exists)
          const headingMatch = section.match(/## ([^\n]+)/);
          const heading = headingMatch ? headingMatch[1] : null;
          const sectionContent = headingMatch ? section.replace(/## ([^\n]+)/, '') : section;
          
          return (
            <div key={idx} className="bg-white dark:bg-gray-750 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {heading && (
                <div className="bg-primary/10 dark:bg-primary/20 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-base font-bold text-primary dark:text-primary-light">{heading}</h2>
                </div>
              )}
              <div className="p-3">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1 text-primary dark:text-primary-light" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-base font-bold mt-3 mb-1 text-primary dark:text-primary-light" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1 text-gray-700 dark:text-gray-300" {...props} />,
                    ul: ({node, ...props}) => <ul className="space-y-1 my-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="space-y-1 my-2 pl-5" {...props} />,
                    li: renderBulletPoint,
                    p: ({node, ...props}) => <p className="my-2" {...props} />,
                    a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded" {...props} />,
                    em: ({node, ...props}) => <em className="text-gray-900 dark:text-white" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-2 bg-gray-50 dark:bg-gray-800 py-1" {...props} />,
                    code: ({node, ...props}) => <code className="bg-gray-100 dark:bg-gray-700 rounded px-1" {...props} />
                  }}
                >
                  {sectionContent}
                </ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  
  // For responses without sections, keep the standard formatting
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1 text-primary dark:text-primary-light" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-base font-bold mt-3 mb-1 text-primary dark:text-primary-light" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1 text-gray-700 dark:text-gray-300" {...props} />,
          ul: ({node, ...props}) => <ul className="space-y-1 my-2" {...props} />,
          ol: ({node, ...props}) => <ol className="space-y-1 my-2 pl-5" {...props} />,
          li: renderBulletPoint,
          p: ({node, ...props}) => <p className="my-2" {...props} />,
          a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded" {...props} />,
          em: ({node, ...props}) => <em className="text-gray-900 dark:text-white" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic my-2 bg-gray-50 dark:bg-gray-800 py-1" {...props} />,
          code: ({node, ...props}) => <code className="bg-gray-100 dark:bg-gray-700 rounded px-1" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const AIAssistant = ({ tenderData, initialPrompt = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Add a welcome message when component mounts
  useEffect(() => {
    const welcomeMessage = tenderData 
      ? 'Hello! I\'m your AI assistant powered by Gemini. How can I help you analyze this tender?'
      : 'Hello! I\'m your AI assistant powered by Gemini. Please navigate to a specific tender to analyze it, or ask me general questions about tenders.';
    
    setMessages([
      {
        role: 'assistant',
        content: welcomeMessage
      }
    ]);
  }, [tenderData]);

  // If an initial prompt is provided, process it automatically
  useEffect(() => {
    if (initialPrompt && tenderData) {
      handleSubmit(null, initialPrompt);
    }
  }, [initialPrompt, tenderData]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e, promptOverride = null) => {
    if (e) e.preventDefault();
    
    const userInput = promptOverride || input;
    if (!userInput.trim() && !promptOverride) return;
    
    // Add user message to chat
    setMessages(prev => [
      ...prev,
      { role: 'user', content: userInput }
    ]);
    
    setInput('');
    setIsLoading(true);
    
    try {
      let response;
      
      if (!tenderData) {
        // Get AI response for general questions using Gemini
        response = await answerGeneralTenderQuestion(userInput);
      } else {
        // Call Gemini API with the tender data
        response = await analyzeTender(tenderData, userInput);
        // Format response for better readability
        response = formatAIResponse(response);
      }
      
      // Add AI response to chat
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response }
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Add error message
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error analyzing the tender. Please try again later.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Predefined prompts for quick analysis
  const getQuickPrompts = () => {
    if (tenderData) {
      return [
        "Summarize the key requirements of this tender",
        "What are the evaluation criteria?",
        "Identify potential risks in this tender",
        "Is the budget appropriate for the scope?",
        "Compare this tender to industry standards"
      ];
    } else {
      return [
        "What is a tender?",
        "How to prepare a good bid?",
        "What makes a competitive proposal?",
        "How to find relevant tenders?",
        "Tips for successful tenders"
      ];
    }
  };

  const quickPrompts = getQuickPrompts();

  // Position class based on fullscreen state
  const positionClass = isFullScreen 
    ? "fixed inset-0 z-50" 
    : "fixed bottom-6 right-6 z-40";

  // Size class based on fullscreen state
  const sizeClass = isFullScreen
    ? "w-full h-screen"
    : "w-80 sm:w-96 h-[500px]";

  return (
    <>
      {/* Fullscreen overlay */}
      {isFullScreen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsFullScreen(false)}></div>
      )}
      
      {/* Chat button - only visible when chat is closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-4">
          <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/40 text-primary dark:text-primary-light rounded-full px-4 py-2 text-sm font-medium animate-pulse">
            Ask AI Assistant
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-primary h-14 w-14 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-primary/90 transition-all"
            aria-label="Open AI Assistant"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25h2.25M19.5 14.5v-2.25a2.25 2.25 0 00-1.591-2.159m4.091-1.591A2.25 2.25 0 0119.5 6.75h-1.875M13.5 3.104c.251.023.501.05.75.082m6 0a24.301 24.301 0 00-7.5 0m0 0c-.621.54-1.173 1.048-1.643 1.496a2.25 2.25 0 00-.659 1.591v5.714" />
            </svg>
          </button>
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className={`${positionClass} transition-all duration-300 ease-in-out`}>
          <div 
            className={`${sizeClass} bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700 ${isFullScreen ? '' : 'mr-0 ml-auto'}`}
          >
            {/* Header */}
            <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25h2.25M19.5 14.5v-2.25a2.25 2.25 0 00-1.591-2.159m4.091-1.591A2.25 2.25 0 0119.5 6.75h-1.875M13.5 3.104c.251.023.501.05.75.082m6 0a24.301 24.301 0 00-7.5 0m0 0c-.621.54-1.173 1.048-1.643 1.496a2.25 2.25 0 00-.659 1.591v5.714" />
                </svg>
                <h3 className="font-semibold">Tender AI Assistant</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={toggleFullScreen}
                  className="text-white/80 hover:text-white p-1"
                  aria-label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullScreen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0l5 0m-5 0l0 5M9 15l-5 5m0 0l5 0m-5 0l0 -5M15 9l5 -5m0 0l-5 0m5 0l0 5M15 15l5 5m0 0l-5 0m5 0l0 -5" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white p-1"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, i) => (
                <div 
                  key={i} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[85%] p-3 rounded-lg 
                    ${message.role === 'user' 
                      ? 'bg-primary/10 text-gray-800 dark:text-white rounded-tr-none' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-none'
                    }
                  `}>
                    {message.role === 'assistant' ? (
                      <FormattedMessage content={message.content} />
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3 rounded-lg bg-gray-100 dark:bg-gray-700 rounded-tl-none">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Quick prompts */}
            <div className="p-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
              <div className="flex space-x-2">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(prompt);
                      handleSubmit(null, prompt);
                    }}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm whitespace-nowrap hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Input form */}
            <form onSubmit={handleSubmit} className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={tenderData ? "Ask about this tender..." : "Ask a question..."}
                  className="flex-1 py-2 px-3 bg-white dark:bg-gray-800 rounded-l-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="bg-primary text-white px-4 rounded-r-lg hover:bg-primary/90 disabled:opacity-50"
                  disabled={isLoading || !input.trim()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant; 