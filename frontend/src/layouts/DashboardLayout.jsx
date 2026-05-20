import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AIAssistantPopup from '../components/AIAssistantPopup';
import { motion } from 'framer-motion';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar Panel */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Page Content Wrapper */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Navigation Bar */}
        <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-w-7xl mx-auto space-y-8"
          >
            {children}
          </motion.div>

          {/* Floating AI Assistant Chatbot */}
          <AIAssistantPopup />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
