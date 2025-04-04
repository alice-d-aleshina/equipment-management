import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="container mx-auto py-6 bg-gray-100 text-gray-800">
      {children}
    </div>
  );
};

export default Layout; 