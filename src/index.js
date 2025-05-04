import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ClerkProvider } from '@clerk/clerk-react';

// Get your Clerk publishable key from environment variables
// For development, you can hardcode it for now
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || 'pk_test_aGlwLXdlYXNlbC0zOC5jbGVyay5hY2NvdW50cy5kZXYk';

if (!PUBLISHABLE_KEY) {
  console.error("Missing Publishable Key")
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);

// Animation observer for fade-in elements
document.addEventListener('DOMContentLoaded', () => {
  const fadeElems = document.querySelectorAll('.fade-in');
  
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });
  
  fadeElems.forEach(elem => {
    observer.observe(elem);
  });
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
