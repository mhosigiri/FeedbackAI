import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { FeedbackForm } from './components/FeedbackForm';
import { Chatbot } from './components/Chatbot';
import { AIWorkflow } from './components/AIWorkflow';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { EmployeeLogin } from './components/EmployeeLogin';
import { MessageSquare, Bot, Workflow, Heart, BarChart3, LogOut } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';

type ViewType = 'customer' | 'login' | 'dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('customer');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('customer');
  };

  const handleBackToCustomer = () => {
    setCurrentView('customer');
  };

  const handleEmployeeAccess = () => {
    setCurrentView('login');
  };

  // Employee Login View
  if (currentView === 'login') {
    return (
      <>
        <EmployeeLogin onLoginSuccess={handleLoginSuccess} onBack={handleBackToCustomer} />
        <Toaster />
      </>
    );
  }

  // Employee Dashboard View
  if (currentView === 'dashboard' && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#E20074] opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-300 opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#E20074] to-[#C4006A] rounded-2xl flex items-center justify-center shadow-lg shadow-pink-300/50">
                  <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10">
                    <rect x="4" y="4" width="16" height="16" rx="2" fill="white"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-gray-900">Employee Analytics Dashboard</h1>
                  <p className="text-gray-600">Comprehensive customer feedback insights</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Dashboard Content */}
          <EmployeeDashboard />

          {/* Footer */}
          <div className="text-center mt-16 text-sm text-gray-500 space-y-1">
            <p>© 2025 T-Mobile USA, Inc., Nvidia Co. Customer Experience AI Platform</p>
            <p className="flex items-center justify-center gap-2">
              Powered by Multi-Agent AI Workflow System
            </p>
            <p>Created by Feedback AI</p>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  // Customer Portal View (Default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#E20074] opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-300 opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1"></div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-[#E20074] to-[#C4006A] rounded-2xl flex items-center justify-center shadow-lg shadow-pink-300/50">
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10">
                  <rect x="4" y="4" width="16" height="16" rx="2" fill="white"/>
                </svg>
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={handleEmployeeAccess}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Employee Dashboard
              </Button>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-gray-900 mb-2 flex items-center justify-center gap-2">
              T-Mobile Customer Intelligence
              <Heart className="w-6 h-6 text-[#E20074] fill-[#E20074]" />
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We value your voice! Share your experience and help us create better moments together
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="feedback" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-12 bg-white/80 backdrop-blur-sm shadow-md p-1 h-auto">
            <TabsTrigger 
              value="feedback" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E20074] data-[state=active]:to-[#C4006A] data-[state=active]:text-white py-3"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Share Feedback</span>
              <span className="sm:hidden">Feedback</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chatbot" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E20074] data-[state=active]:to-[#C4006A] data-[state=active]:text-white py-3"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Assistant</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="workflow" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E20074] data-[state=active]:to-[#C4006A] data-[state=active]:text-white py-3"
            >
              <Workflow className="w-4 h-4" />
              <span className="hidden sm:inline">AI Workflow</span>
              <span className="sm:hidden">Workflow</span>
            </TabsTrigger>
          </TabsList>

          {/* Feedback Form Tab */}
          <TabsContent value="feedback" className="mt-0">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 text-center">
                <h2 className="text-gray-900 mb-3">We'd Love to Hear from You!</h2>
                <p className="text-gray-600">
                  Your voice matters. Every piece of feedback helps us create better experiences tailored just for you.
                </p>
              </div>
              <FeedbackForm />
            </div>
          </TabsContent>

          {/* Chatbot Tab */}
          <TabsContent value="chatbot" className="mt-0">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 text-center">
                <h2 className="text-gray-900 mb-3">Chat with Our Friendly AI Assistant 🤖</h2>
                <p className="text-gray-600">
                  Get instant answers and personalized help - we're here for you 24/7!
                </p>
              </div>
              <Chatbot />
            </div>
          </TabsContent>

          {/* AI Workflow Tab */}
          <TabsContent value="workflow" className="mt-0">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8 text-center">
                <h2 className="text-gray-900 mb-3">AI-Powered Feedback Processing</h2>
                <p className="text-gray-600">
                  See how our multi-step AI workflow intelligently processes and routes customer feedback
                </p>
              </div>
              <AIWorkflow />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-gray-500 space-y-1">
          <p>© 2025 T-Mobile USA, Inc., Nvidia Co. Customer Experience AI Platform</p>
          <p className="flex items-center justify-center gap-2">
            Powered by Multi-Agent AI Workflow System
          </p>
          <p>Created by Feedback AI</p>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
