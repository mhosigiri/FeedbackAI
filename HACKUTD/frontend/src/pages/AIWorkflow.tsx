import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, ArrowRight, TrendingUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface WorkflowStep {
  id: string;
  title: string;
  agent: string;
  status: 'complete' | 'processing' | 'pending';
  description: string;
  timeInfo?: string;
  processingText?: string;
}

const AIWorkflow: React.FC = () => {
  const navigate = useNavigate();

  const workflowSteps: WorkflowStep[] = [
    {
      id: '1',
      title: 'Intake & Classification',
      agent: 'Intake Agent',
      status: 'complete',
      description: 'AI analyzes feedback and categorizes by sentiment and topic',
      timeInfo: 'Completed in 0.3s',
    },
    {
      id: '2',
      title: 'Sentiment Analysis',
      agent: 'Sentiment Agent',
      status: 'processing',
      description: 'Deep analysis of customer emotions and urgency level',
      processingText: 'Processing feedback data...',
    },
    {
      id: '3',
      title: 'Route & Prioritize',
      agent: 'Routing Agent',
      status: 'pending',
      description: 'Routes to appropriate department based on priority and category',
    },
    {
      id: '4',
      title: 'Generate Insights',
      agent: 'Analytics Agent',
      status: 'pending',
      description: 'Creates actionable insights and recommendations',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'processing':
        return <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />;
      default:
        return <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Complete
          </span>
        );
      case 'processing':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Processing
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0B0B]">
      <main className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full flex items-center justify-between py-6 px-6 border-b border-gray-200 dark:border-gray-800" role="banner">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#E20074] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-center flex-1 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            AI Workflow
          </h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </header>

        {/* Workflow Content */}
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Feedback Processing Pipeline
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Track your feedback through our AI-powered workflow system
              </p>
            </motion.div>

            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 bg-gradient-to-r from-[#E20074] to-[#FF0066] rounded-2xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6" />
                <h3 className="text-xl font-bold">Workflow Summary</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-sm opacity-90">Total Steps</p>
                  <p className="text-2xl font-bold">{workflowSteps.length}</p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Completed</p>
                  <p className="text-2xl font-bold">
                    {workflowSteps.filter(s => s.status === 'complete').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Processing</p>
                  <p className="text-2xl font-bold">
                    {workflowSteps.filter(s => s.status === 'processing').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Pending</p>
                  <p className="text-2xl font-bold">
                    {workflowSteps.filter(s => s.status === 'pending').length}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Workflow Steps */}
            <div className="space-y-6">
              {workflowSteps.map((step, index) => (
                <React.Fragment key={step.id}>
                  {/* Step Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white dark:bg-[#121212] rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(step.status)}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                              {step.title}
                            </h3>
                            <p className="text-sm text-[#E20074] font-medium mb-2">
                              {step.agent}
                            </p>
                          </div>
                          {getStatusBadge(step.status)}
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {step.description}
                        </p>

                        {/* Time Info or Processing Text */}
                        {step.status === 'complete' && step.timeInfo && (
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                            {step.timeInfo}
                          </p>
                        )}

                        {step.status === 'processing' && step.processingText && (
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <motion.div
                                className="w-2 h-2 bg-yellow-500 rounded-full"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                              />
                              <motion.div
                                className="w-2 h-2 bg-yellow-500 rounded-full"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                              />
                              <motion.div
                                className="w-2 h-2 bg-yellow-500 rounded-full"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                              />
                            </div>
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                              {step.processingText}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Arrow Connector */}
                  {index < workflowSteps.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                      className="flex justify-center py-2"
                    >
                      <ArrowDown className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                    </motion.div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIWorkflow;

