import ResizeObserver from 'resize-observer-polyfill';  // Import the polyfill at the top of the file
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

if (typeof window !== 'undefined') {
  const ro = new ResizeObserver(() => {
    // this empty callback will "consume" the undelivered notifications
  });
  ro.observe(document.body);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);

reportWebVitals();
