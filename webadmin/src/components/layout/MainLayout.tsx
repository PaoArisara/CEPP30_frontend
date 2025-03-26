import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-bg p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;