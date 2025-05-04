import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

// Initialize the Gemini API
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyBDNBXFBh0pUP70oFIt-yjW8WHIRNXEWGc';
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Analyze tender data using Gemini AI
 * @param {Object} tenderData - The tender data to analyze
 * @param {string} question - The question or analysis request
 * @returns {Promise<string>} - The AI response
 */
export const analyzeTender = async (tenderData, question) => {
  try {
    // If API key is not set, return a message
    if (!API_KEY) {
      return "Gemini API key is not configured. Please add your API key to the .env file.";
    }
    
    // Prepare the context for the AI
    const context = JSON.stringify(tenderData);
    
    // Create the prompt with context and the user's question
    const prompt = `
      As an AI assistant for tender analysis, please analyze the following tender data:
      
      ${context}
      
      Question: ${question}
      
      Provide a detailed analysis focusing on the requested information.
    `;
    
    // Generate content from Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error analyzing tender with Gemini:', error);
    return 'Sorry, I encountered an error while analyzing the tender. Please try again later.';
  }
};

/**
 * Handle general tender questions using Gemini AI
 * @param {string} question - The general question about tenders
 * @returns {Promise<string>} - The AI response
 */
export const answerGeneralTenderQuestion = async (question) => {
  try {
    // If API key is not set, return a message
    if (!API_KEY) {
      return "Gemini API key is not configured. Please add your API key to the .env file.";
    }
    
    // Create the prompt for general tender questions
    const prompt = `
      You are an AI assistant for a tender management system. Answer the following general question about tenders:
      
      Question: ${question}
      
      If the question is a greeting like "hi", "hello", or "hey", respond with a friendly introduction about how you can help with tender-related questions.
      
      If the question is about how to find relevant tenders, explain how users might filter and search for tenders in a procurement system.
      
      If the question is about preparing bids or proposals, provide practical tips and best practices.
      
      If the question is about tender evaluation criteria or processes, explain common approaches and important factors.
      
      Provide a concise, helpful response focused on procurement and tenders. Limit your response to 4-5 sentences maximum unless a detailed breakdown is requested.
    `;
    
    // Generate content from Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error getting AI response for general question:', error);
    
    // Fallback responses if the API fails
    if (question.toLowerCase().includes('hello') || question.toLowerCase().includes('hi')) {
      return "Hello! I'm your tender assistant. I can help with general questions about tenders or analyze specific tenders when you navigate to them. How can I help you today?";
    }
    
    return 'Sorry, I encountered an error while generating a response. Please try again later.';
  }
};

/**
 * Generate dashboard insights using Gemini 1.5 Flash
 * @param {Array} tenders - Array of all tenders
 * @returns {Promise<Object>} - Object containing dashboard insights
 */
export const generateTenderInsights = async (tenders) => {
  try {
    if (!API_KEY) {
      return {
        topCategories: ["API Key Required"],
        averageBudget: "Configure API Key",
        highestInterest: ["Configure your Gemini API Key"],
        deadlinePatterns: "To view AI insights, please configure your Gemini API Key.",
        recommendations: "Visit Google AI Studio to get your API key."
      };
    }

    // Get Gemini 1.5 Flash model for faster processing
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create a comprehensive prompt for dashboard analysis
    const prompt = `
      Analyze this procurement data and provide strategic insights:

      TENDER DATA:
      ${JSON.stringify(tenders, null, 2)}

      Provide a comprehensive dashboard analysis covering:

      1. Category Analysis:
         - Identify the most common tender categories
         - Detect emerging procurement trends
         - Highlight underserved categories

      2. Budget Insights:
         - Calculate average budget across all tenders
         - Identify budget distribution patterns
         - Flag any unusual budget allocations

      3. Engagement Metrics:
         - List tenders with highest supplier interest
         - Analyze proposal submission patterns
         - Identify factors driving supplier participation

      4. Timeline Analysis:
         - Analyze submission deadline patterns
         - Identify optimal posting times
         - Flag any seasonal trends

      5. Strategic Recommendations:
         - Suggest improvements for tender descriptions
         - Recommend ways to increase supplier participation
         - Propose category diversification strategies

      Format the response as a JSON object with this structure:
      {
        "topCategories": ["Category 1", "Category 2", "Category 3"],
        "averageBudget": "Formatted budget with analysis",
        "highestInterest": ["Tender 1", "Tender 2", "Tender 3"],
        "deadlinePatterns": "Detailed analysis of submission patterns and timing",
        "recommendations": "Strategic recommendations for improvement",
        "emergingTrends": ["Trend 1", "Trend 2", "Trend 3"],
        "riskAreas": ["Risk 1", "Risk 2"],
        "opportunities": ["Opportunity 1", "Opportunity 2"]
      }
    `;

    // Generate content using Gemini 1.5 Flash
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Parse and validate the JSON response
    try {
      const parsedResponse = JSON.parse(response);
      return {
        ...parsedResponse,
        generatedAt: new Date().toISOString()
      };
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return extractInsightsFromText(response);
    }
  } catch (error) {
    console.error('Error generating dashboard insights:', error);
    return {
      error: 'Failed to generate insights',
      message: error.message,
      topCategories: ["Error occurred"],
      averageBudget: "Error analyzing budget data",
      highestInterest: ["Error retrieving interest data"],
      deadlinePatterns: "Error analyzing submission patterns",
      recommendations: "Please check your console for details and ensure your API key is valid."
    };
  }
};

// Helper function to extract insights from unstructured text
const extractInsightsFromText = (text) => {
  const insights = {
    topCategories: [],
    averageBudget: "",
    highestInterest: [],
    deadlinePatterns: "",
    recommendations: "",
    emergingTrends: [],
    riskAreas: [],
    opportunities: []
  };

  // Extract categories
  const categoryMatch = text.match(/categories?:?\s*([^.]+)/i);
  if (categoryMatch) {
    insights.topCategories = categoryMatch[1]
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat.length > 0);
  }

  // Extract budget information
  const budgetMatch = text.match(/budget:?\s*([^.]+)/i);
  if (budgetMatch) {
    insights.averageBudget = budgetMatch[1].trim();
  }

  // Extract high interest tenders
  const interestMatch = text.match(/interest:?\s*([^.]+)/i);
  if (interestMatch) {
    insights.highestInterest = interestMatch[1]
      .split(',')
      .map(tender => tender.trim())
      .filter(tender => tender.length > 0);
  }

  // Extract deadline patterns
  const deadlineMatch = text.match(/deadline patterns?:?\s*([^.]+)/i);
  if (deadlineMatch) {
    insights.deadlinePatterns = deadlineMatch[1].trim();
  }

  // Extract recommendations
  const recommendationsMatch = text.match(/recommendations?:?\s*([^.]+)/i);
  if (recommendationsMatch) {
    insights.recommendations = recommendationsMatch[1].trim();
  }

  return insights;
};

/**
 * Analyze proposals for a tender and recommend the best candidate
 * @param {Object} tenderData - The tender data
 * @param {Array} proposalsData - Array of proposals for the tender
 * @returns {Promise<Object>} - Object containing analysis and recommendation
 */
export const analyzeProposalsForTender = async (tenderData, proposalsData) => {
  try {
    // If API key is not set, return a fallback object
    if (!API_KEY) {
      return {
        recommendation: "Gemini API key is not configured. Please add your API key to the .env file.",
        analysis: [],
        summary: "Configure your API key to use AI analysis."
      };
    }
    
    // Create a prompt for analyzing proposals
    const prompt = `
      As an AI assistant for tender evaluation, please analyze the following tender and its proposals:
      
      TENDER INFORMATION:
      ${JSON.stringify(tenderData, null, 2)}
      
      PROPOSALS SUBMITTED (${proposalsData.length}):
      ${JSON.stringify(proposalsData, null, 2)}
      
      Based on the tender requirements and the submitted proposals, analyze each proposal and recommend the most suitable candidate.
      
      Evaluate each proposal based on these key factors:
      1. Price competitiveness relative to the tender budget and other proposals
      2. Technical compliance with the tender requirements
      3. Experience and credibility of the supplier
      4. Overall quality of the proposal content
      5. Value for money
      
      Format your response as a JSON object with the following structure:
      {
        "recommendation": {
          "proposalId": "ID of the recommended proposal",
          "title": "Title of the recommended proposal", 
          "reasons": ["Reason 1", "Reason 2", "Reason 3"]
        },
        "analysis": [
          {
            "proposalId": "ID",
            "title": "Proposal title",
            "strengths": ["Strength 1", "Strength 2"],
            "weaknesses": ["Weakness 1", "Weakness 2"],
            "score": "Score out of 100",
            "valueForMoney": "Rating out of 10"
          }
        ],
        "summary": "Brief summary of the overall analysis and why the recommended proposal stands out."
      }
      
      If there are no clear winners, indicate this and provide a fair assessment of all proposals.
      If there are no proposals, indicate this and suggest potential reasons.
    `;
    
    // Generate content from Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      // Parse the JSON response
      return JSON.parse(response);
    } catch (parseError) {
      console.error('Error parsing Gemini response as JSON:', parseError);
      
      // Return the raw text if JSON parsing fails
      return {
        recommendation: "Could not generate structured recommendation",
        analysis: [],
        summary: response
      };
    }
  } catch (error) {
    console.error('Error analyzing proposals with Gemini:', error);
    return {
      recommendation: "An error occurred during AI analysis",
      analysis: [],
      summary: `Error: ${error.message}. Please try again later.`
    };
  }
};

export default {
  analyzeTender,
  answerGeneralTenderQuestion,
  generateTenderInsights,
  analyzeProposalsForTender
};