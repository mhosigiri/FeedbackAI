import React from 'react';
import { motion } from 'framer-motion';

interface WorkItem {
  id: number;
  title: string;
  description: string;
  status: 'In Progress' | 'Under Review' | 'Fixed';
  priority: 'high' | 'medium' | 'low';
}

const AlreadyWorkingOn: React.FC = () => {
  // Dummy data - will be replaced with backend data later
  const workItems: WorkItem[] = [
    {
      id: 1,
      title: 'Network Coverage Enhancement',
      description: 'Improving 5G coverage in downtown areas',
      status: 'In Progress',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Customer Service Bot Update',
      description: 'Updating AI responses for billing inquiries',
      status: 'Under Review',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Mobile App Performance',
      description: 'Optimizing app load times and responsiveness',
      status: 'In Progress',
      priority: 'high'
    },
    {
      id: 4,
      title: 'Data Security Audit',
      description: 'Reviewing security protocols and compliance',
      status: 'Under Review',
      priority: 'high'
    },
    {
      id: 5,
      title: 'Billing System Integration',
      description: 'Integrating new payment gateway',
      status: 'Fixed',
      priority: 'medium'
    },
    {
      id: 6,
      title: 'Customer Feedback Portal',
      description: 'Enhancing feedback collection interface',
      status: 'In Progress',
      priority: 'low'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'Under Review':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'Fixed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '⚠️';
      case 'medium':
        return '🔧';
      case 'low':
        return '✅';
      default:
        return '📋';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="bg-white dark:bg-[#121212] rounded-2xl shadow-md p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Already Working On
      </h3>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto pr-2 space-y-3"
      >
        {workItems.map((item, index) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 4 }}
            transition={{ duration: 0.2 }}
            className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-lg flex-shrink-0">{getPriorityIcon(item.priority)}</span>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {item.title}
                </h4>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 ml-7">
              {item.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default AlreadyWorkingOn;

