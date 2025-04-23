import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6">
        {children}
      </div>
    </div>
  );
};

export default Layout; 