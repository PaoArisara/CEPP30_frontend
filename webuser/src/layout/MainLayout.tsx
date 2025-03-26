import React, { ReactNode } from 'react';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <Navbar />
      </div>

      {/* Main content area */}
      <div className="flex-1 pt-16 pb-10"> 
        <main className="h-full">
          <div className="max-w-2xl mx-auto px-4">
            {children}
          </div>
        </main>
      </div>

      <div className="h-20" /> 
    </div>
  );
};

export default MainLayout;