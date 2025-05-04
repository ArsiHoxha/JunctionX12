import React, { useState, useEffect } from 'react';
import { SignInButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';

const LandingPage = ({ section }) => {
  const { theme, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Custom CSS for better responsiveness using media queries
  const responsiveStyles = `
    @media (max-width: 640px) {
      .hero-heading {
        font-size: 2.5rem !important;
        line-height: 1.2 !important;
      }
      .hero-subheading {
        font-size: 2rem !important;
        line-height: 1.2 !important;
      }
      .section-padding {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
      }
      .feature-card {
        padding: 1.25rem !important;
      }
      .mobile-stack {
        flex-direction: column !important;
      }
      .mobile-full-width {
        width: 100% !important; 
        max-width: 100% !important;
      }
      .mobile-text-center {
        text-align: center !important;
      }
      .mobile-hidden {
        display: none !important;
      }
      .mobile-mt-2 {
        margin-top: 0.5rem !important;
      }
      .mobile-mb-2 {
        margin-bottom: 0.5rem !important;
      }
      body {
        overflow-x: hidden !important;
      }
      html {
        overflow-x: hidden !important;
      }
    }
    
    @media (min-width: 641px) and (max-width: 1023px) {
      .tablet-text-lg {
        font-size: 1.125rem !important;
      }
      .tablet-p-6 {
        padding: 1.5rem !important;
      }
      .tablet-gap-4 {
        gap: 1rem !important;
      }
    }
    
    @media (min-width: 1024px) {
      .desktop-text-xl {
        font-size: 1.25rem !important;
      }
      .desktop-p-8 {
        padding: 2rem !important;
      }
    }
    
    /* Additional animation for smooth transitions */
    .smooth-transition {
      transition: all 0.3s ease-in-out !important;
    }
  `;
  
  // Check viewport size for responsive adjustments
  useEffect(() => {
    // Insert the custom styles for better responsiveness
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.appendChild(document.createTextNode(responsiveStyles));
    document.head.appendChild(styleElement);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Fix horizontal overflow
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
      // Remove style element on component unmount
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
      // Reset overflow
      document.body.style.overflowX = '';
      document.documentElement.style.overflowX = '';
    };
  }, [responsiveStyles]);
  
  // If section is specified, we can scroll to that section on mount
  useEffect(() => {
    if (section && document.getElementById(section)) {
      document.getElementById(section).scrollIntoView({ behavior: 'smooth' });
    }
  }, [section]);

  // Update the mobile menu to handle better on small screens
  const mobileMenuClasses = mobileMenuOpen
    ? "md:hidden py-3 border-t border-gray-200 dark:border-gray-700 absolute left-0 right-0 top-16 bg-white dark:bg-gray-900 shadow-md z-50 w-full"
    : "hidden";

  // Add useEffect to set the viewport meta tag for proper scaling
  useEffect(() => {
    // Set viewport meta tag for proper scaling on all devices
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
      document.head.appendChild(meta);
    }
  }, []);

  // Add useEffect to handle touch events for better mobile experience
  useEffect(() => {
    // Improve touch handling for mobile devices
    const touchStartHandler = (e) => {
      // Store the initial touch position for potential swipe detection
      const touchObj = e.changedTouches[0];
      window.startX = touchObj.pageX;
      window.startY = touchObj.pageY;
    };
    
    const touchEndHandler = (e) => {
      // Handle touch end for potential swipe actions
      const touchObj = e.changedTouches[0];
      const distX = touchObj.pageX - window.startX;
      const distY = touchObj.pageY - window.startY;
      
      // If horizontal swipe detected and significant enough
      if (Math.abs(distX) > 100 && Math.abs(distY) < 50) {
        // Potential swipe action could be implemented here
        // For example, navigating between sections
      }
    };
    
    // Add touch event listeners
    document.addEventListener('touchstart', touchStartHandler, false);
    document.addEventListener('touchend', touchEndHandler, false);
    
    // Performance optimization for mobile devices
    const mobileOptimizations = () => {
      // Check if on mobile
      if (window.innerWidth < 768) {
        // Reduce animation complexity
        document.querySelectorAll('.hover\\:shadow-xl, .hover\\:-translate-y-1').forEach(el => {
          el.classList.remove('hover:shadow-xl', 'hover:-translate-y-1');
        });
        
        // Reduce background element complexity
        document.querySelectorAll('.absolute.opacity-20').forEach(el => {
          // Make background elements simpler
          if (!el.classList.contains('essential-bg')) {
            el.style.display = 'none';
          }
        });
      }
    };
    
    // Run optimizations on load
    mobileOptimizations();
    window.addEventListener('resize', mobileOptimizations);
    
    // Cleanup
    return () => {
      document.removeEventListener('touchstart', touchStartHandler);
      document.removeEventListener('touchend', touchEndHandler);
      window.removeEventListener('resize', mobileOptimizations);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
      {/* Hero Section - using custom classes for better responsiveness */}
      <section className="relative pt-8 md:pt-12 min-h-screen bg-white dark:bg-gray-900 overflow-hidden flex items-center section-padding smooth-transition w-full">
        {/* Geometric background elements - dark mode aesthetic with optimization classes */}
        <div className="absolute inset-0 overflow-hidden z-0 w-full">
          {/* Circle element top-left - reduced size on mobile */}
          <div className="essential-bg absolute top-10 left-5 sm:left-10 w-40 sm:w-64 h-40 sm:h-64 border-4 border-gray-800 dark:border-gray-700 rounded-full opacity-20 max-w-[80%]"></div>
          
          {/* Square element bottom-right - hidden on very small screens */}
          <div className="hidden sm:block absolute bottom-20 right-10 sm:right-20 w-60 sm:w-80 h-60 sm:h-80 border-4 border-gray-800 dark:border-gray-700 rotate-12 opacity-20 max-w-[80%]"></div>
          
          {/* Small circle middle-right */}
          <div className="absolute top-1/3 right-10 md:right-1/4 w-20 md:w-24 h-20 md:h-24 bg-gray-800 dark:bg-gray-700 rounded-full opacity-10 max-w-[20%]"></div>
          
          {/* Horizontal lines left - shorter on mobile */}
          <div className="essential-bg absolute top-1/3 left-0 w-1/6 sm:w-1/4 h-px bg-gray-700 dark:bg-gray-600 opacity-30"></div>
          <div className="absolute top-1/3 -translate-y-6 left-0 w-1/12 sm:w-1/6 h-px bg-gray-700 dark:bg-gray-600 opacity-30"></div>
          <div className="absolute top-1/3 translate-y-6 left-0 w-1/8 sm:w-1/5 h-px bg-gray-700 dark:bg-gray-600 opacity-30"></div>
          
          {/* Vertical lines right - shorter on mobile */}
          <div className="essential-bg absolute top-0 right-1/3 md:right-1/4 w-px h-1/4 md:h-1/3 bg-gray-700 dark:bg-gray-600 opacity-30"></div>
          <div className="absolute top-0 right-1/3 md:right-1/4 -translate-x-6 w-px h-1/6 md:h-1/4 bg-gray-700 dark:bg-gray-600 opacity-30"></div>
          <div className="absolute top-0 right-1/3 md:right-1/4 translate-x-6 w-px h-1/8 md:h-1/5 bg-gray-700 dark:bg-gray-600 opacity-30"></div>
          
          {/* Diamond element bottom-left - smaller on mobile */}
          <div className="absolute bottom-10 left-10 sm:left-1/4 w-24 sm:w-32 h-24 sm:h-32 border-4 border-gray-800 dark:border-gray-700 opacity-20 rotate-45 max-w-[20%]"></div>
          
          {/* Grid pattern top-right - hidden on very small screens */}
          <div className="hidden sm:grid absolute top-10 right-10 grid-cols-3 gap-2 sm:gap-4 opacity-20">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-800 dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
        
        <div className="w-full max-w-7xl mx-auto py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1 rounded-md bg-gray-800 dark:bg-gray-800 text-gray-200 dark:text-gray-200 text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
              Next Generation Procurement Platform
            </span>
            <h2 className="hero-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight smooth-transition">
              <span className="block">Streamlined Procurement</span>
              <span className="hero-subheading block mt-2 text-gray-800 dark:text-gray-300">
                Management System
              </span>
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0 tablet-text-lg desktop-text-xl">
              A comprehensive platform for efficient tender management, evaluation, and approval processes with 
              <span className="text-gray-800 dark:text-gray-300 font-medium"> AI-powered analytics</span>.
            </p>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4 sm:px-0 mobile-stack">
              <SignedIn>
                {/* Show dashboard link when signed in */}
                <Link 
                  to="/dashboard" 
                  className="mobile-full-width w-full sm:w-auto px-6 sm:px-8 py-3 text-base font-medium text-white bg-gray-800 dark:bg-gray-800 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 transition-all shadow-lg transform hover:-translate-y-1 smooth-transition"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
              <SignedOut>
                {/* Show sign-in button when signed out */}
                <SignInButton mode="modal">
                  <button 
                    className="mobile-full-width w-full sm:w-auto px-6 sm:px-8 py-3 text-base font-medium text-white bg-gray-800 dark:bg-gray-800 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 transition-all shadow-lg transform hover:-translate-y-1 smooth-transition"
                  >
                    Get Started
                  </button>
                </SignInButton>
              </SignedOut>
              <a 
                href="#features" 
                className="mobile-full-width w-full sm:w-auto px-6 sm:px-8 py-3 text-base font-medium text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 smooth-transition"
                role="button"
                tabIndex="0"
                aria-label="Learn more about our features"
                onTouchStart={() => {}} // Empty handler to enable active states on iOS
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 dark:bg-gray-800 opacity-20"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-900 relative overflow-hidden w-full">
        {/* Background decoration - optimized for different screen sizes */}
        <div className="hidden lg:block absolute -right-40 top-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="hidden lg:block absolute -left-40 bottom-1/4 w-96 h-96 bg-accent/5 dark:bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
        
        {/* Mobile-friendly background for smaller screens */}
        <div className="lg:hidden absolute right-0 top-20 w-48 h-48 bg-primary/5 dark:bg-primary/10 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
        <div className="lg:hidden absolute left-0 bottom-20 w-48 h-48 bg-accent/5 dark:bg-accent/10 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <span className="inline-block px-3 py-1 sm:px-4 sm:py-1 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              POWERFUL CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Enterprise-Grade Features
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mb-6 sm:mb-8"></div>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform provides a complete solution for tender management with AI-powered tools, 
              advanced security, and intuitive interfaces.
            </p>
          </div>
          
          {/* Feature Cards content - responsive grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 px-4 sm:px-6 lg:px-0">
            {/* Feature Card 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-5 sm:p-6 lg:p-8 border border-gray-100 dark:border-gray-700 group hover:border-primary/20 dark:hover:border-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-3 w-12 h-12 sm:p-4 sm:w-14 sm:h-14 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors relative">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 relative">Real-time Analytics</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed relative">
                Interactive dashboards with KPI tiles and customizable visualizations for monitoring procurement processes and tracking performance metrics.
              </p>
              <a href="#" className="text-primary dark:text-blue-400 text-sm sm:text-base font-medium inline-flex items-center group-hover:underline relative">
                Learn more
                <svg className="ml-1 h-3 w-3 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            
            {/* Feature Card 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-5 sm:p-6 lg:p-8 border border-gray-100 dark:border-gray-700 group hover:border-primary/20 dark:hover:border-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-3 w-12 h-12 sm:p-4 sm:w-14 sm:h-14 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors relative">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 relative">Enhanced Security</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed relative">
                Enterprise-grade security with role-based access control, data encryption, and comprehensive audit trails for all procurement activities.
              </p>
              <a href="#" className="text-primary dark:text-blue-400 text-sm sm:text-base font-medium inline-flex items-center group-hover:underline relative">
                Learn more
                <svg className="ml-1 h-3 w-3 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all p-5 sm:p-6 lg:p-8 border border-gray-100 dark:border-gray-700 group hover:border-primary/20 dark:hover:border-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-3 w-12 h-12 sm:p-4 sm:w-14 sm:h-14 flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors relative">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 relative">AI-Powered Insights</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed relative">
                Leverage machine learning for intelligent supplier recommendations, risk assessment, and predictive analytics for procurement optimization.
              </p>
              <a href="#" className="text-primary dark:text-blue-400 text-sm sm:text-base font-medium inline-flex items-center group-hover:underline relative">
                Learn more
                <svg className="ml-1 h-3 w-3 sm:h-4 sm:w-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Mini features section */}
          <div className="mt-16 sm:mt-20 lg:mt-24 mb-8 sm:mb-12 lg:mb-16 px-4 sm:px-6 lg:px-0">
            <div className="text-center mb-10 sm:mb-12 lg:mb-16">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Comprehensive Functionality</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
                Our platform offers everything you need to streamline your procurement processes
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 fade-in">
              {/* Mini feature 1 */}
              <div className="p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-primary/20 dark:hover:border-primary/30">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-2 mr-3">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Workflow Automation</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">Automate routine procurement tasks and approval workflows for maximum efficiency</p>
              </div>
              
              {/* Mini feature 2 */}
              <div className="p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-primary/20 dark:hover:border-primary/30">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-2 mr-3">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Cloud Integration</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">Seamless integration with your existing cloud infrastructure and business systems</p>
              </div>
              
              {/* Mini feature 3 */}
              <div className="p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-primary/20 dark:hover:border-primary/30">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-2 mr-3">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Real-time Collaboration</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">Collaborate with stakeholders in real-time with comments, notifications, and shared documents</p>
              </div>
              
              {/* Mini feature 4 */}
              <div className="p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-primary/20 dark:hover:border-primary/30">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="rounded-full bg-primary/10 dark:bg-primary/20 p-2 mr-3">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Compliance Management</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">Ensure compliance with regulations and internal procurement policies at every step</p>
              </div>
            </div>
          </div>
          
          {/* Call-to-action */}
          <div className="mt-12 sm:mt-16 lg:mt-20 text-center p-4 sm:p-6 lg:p-8 mx-4 sm:mx-6 lg:mx-0 bg-gradient-to-r from-primary to-accent/5 dark:from-primary/20 dark:to-accent/20 rounded-2xl shadow-lg">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">Ready to transform your procurement process?</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-6 sm:mb-8">Join thousands of organizations that trust our platform for their procurement needs.</p>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-lg hover:shadow-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-1">
                  Get Started Today
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8 sm:py-12 mt-auto w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <span className="text-xl font-bold text-gray-900 dark:text-white">ProcurementPro</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">© {new Date().getFullYear()} All rights reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center space-x-4 sm:space-x-6">
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 text-sm sm:text-base">
                Terms
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 text-sm sm:text-base">
                Privacy
              </a>
              <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 text-sm sm:text-base">
                Contact
              </a>
            </div>
          </div>
          
          {/* Additional footer content for mobile */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center md:hidden">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400">Documentation</a></li>
                  <li><a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400">Support</a></li>
                  <li><a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400">API</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400">About</a></li>
                  <li><a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400">Blog</a></li>
                  <li><a href="#" className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400">Careers</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 