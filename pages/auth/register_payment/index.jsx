import React, { useEffect } from 'react';
import Payment from './Payment';

const Index = () => {
  // Function to initialize Tailwind CSS
  const initializeTailwind = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
    
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
    
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    // Initialize Tailwind CSS
    initializeTailwind().then(() => {
      // Check if the page has already been reloaded
      if (!sessionStorage.getItem('pageReloaded')) {
        sessionStorage.setItem('pageReloaded', 'true');
        setTimeout(() => {
          window.location.reload();
        }, 0); // Adjust the timeout duration as needed (in milliseconds)
      } else {
        // Remove the flag for future loads
        sessionStorage.removeItem('pageReloaded');
      }
    });
  }, []);

  return (
    <div>
      <Payment/>
    </div>
  );
};

export default Index;
