import React from 'react';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B]">
      <Sidebar />
      <main className="min-h-screen transition-all duration-300 md:ml-[250px]">
        {/* Dashboard Section */}
        <section id="dashboard" className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Welcome to your T-Mobile Feedback AI Dashboard. Monitor customer feedback and insights in real-time.
            </p>
          </div>
        </section>

        {/* Insights Section */}
        <section id="insights" className="min-h-screen flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Insights
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Analyze customer feedback patterns, sentiment trends, and key metrics to make data-driven decisions.
            </p>
          </div>
        </section>

        {/* Settings Section */}
        <section id="settings" className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Settings
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Configure your preferences, notification settings, and account details.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;

