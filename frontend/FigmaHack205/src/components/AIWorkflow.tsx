import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { CheckCircle2, Circle, Clock, ArrowRight, Zap, Brain, MessageSquare, BarChart3, Heart, TrendingUp } from 'lucide-react';

interface WorkflowStep {
  id: number;
  name: string;
  agent: string;
  icon: any;
  status: 'completed' | 'in-progress' | 'pending';
  description: string;
  duration?: string;
}

interface FeedbackItem {
  id: number;
  customer: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  currentStep: number;
  timestamp: string;
}

export function AIWorkflow() {
  const [activeWorkflows, setActiveWorkflows] = useState<FeedbackItem[]>([
    {
      id: 1,
      customer: 'Sarah J.',
      sentiment: 'negative',
      category: 'Network Coverage',
      currentStep: 2,
      timestamp: '2 min ago',
    },
    {
      id: 2,
      customer: 'Mike T.',
      sentiment: 'positive',
      category: 'Customer Service',
      currentStep: 4,
      timestamp: '5 min ago',
    },
    {
      id: 3,
      customer: 'Emma R.',
      sentiment: 'neutral',
      category: 'Billing',
      currentStep: 1,
      timestamp: '8 min ago',
    },
  ]);

  const workflowSteps: WorkflowStep[] = [
    {
      id: 1,
      name: 'Intake & Classification',
      agent: 'Intake Agent',
      icon: MessageSquare,
      status: 'completed',
      description: 'AI analyzes feedback and categorizes by sentiment and topic',
      duration: '0.3s',
    },
    {
      id: 2,
      name: 'Sentiment Analysis',
      agent: 'Sentiment Agent',
      icon: Brain,
      status: 'in-progress',
      description: 'Deep analysis of customer emotions and urgency level',
      duration: '0.5s',
    },
    {
      id: 3,
      name: 'Route & Prioritize',
      agent: 'Routing Agent',
      icon: Zap,
      status: 'pending',
      description: 'Routes to appropriate department based on priority and category',
      duration: '0.2s',
    },
    {
      id: 4,
      name: 'Generate Insights',
      agent: 'Analytics Agent',
      icon: BarChart3,
      status: 'pending',
      description: 'Creates actionable insights and recommendations',
      duration: '0.8s',
    },
  ];

  const [selectedWorkflow, setSelectedWorkflow] = useState<FeedbackItem | null>(
    activeWorkflows[0]
  );

  const getSentimentConfig = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return {
          className: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300',
          icon: '😊'
        };
      case 'neutral':
        return {
          className: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300',
          icon: '😐'
        };
      case 'negative':
        return {
          className: 'bg-gradient-to-r from-red-100 to-orange-100 text-red-800 border-red-300',
          icon: '😞'
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: '❓'
        };
    }
  };

  const getStepStatus = (stepId: number): 'completed' | 'in-progress' | 'pending' => {
    if (!selectedWorkflow) return 'pending';
    if (stepId < selectedWorkflow.currentStep) return 'completed';
    if (stepId === selectedWorkflow.currentStep) return 'in-progress';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-2xl shadow-purple-200/50 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
          <CardTitle>
            AI Agent Workflow
          </CardTitle>
          <CardDescription>
            Watch how we thoughtfully process and act on your feedback! ✨
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          {/* Workflow Steps */}
          <div className="space-y-2">
            {workflowSteps.map((step, index) => {
              const status = getStepStatus(step.id);
              const Icon = step.icon;
              
              return (
                <div key={step.id}>
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50/50 transition-colors">
                    {/* Icon */}
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-md ${
                        status === 'completed'
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                          : status === 'in-progress'
                          ? 'bg-gradient-to-br from-[#E20074] to-[#C4006A] animate-pulse shadow-lg shadow-pink-300/50'
                          : 'bg-gradient-to-br from-gray-200 to-gray-300'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="w-7 h-7 text-white" strokeWidth={2.5} />
                      ) : status === 'in-progress' ? (
                        <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                      ) : (
                        <Circle className="w-7 h-7 text-gray-400" strokeWidth={2} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-gray-900">{step.name}</h4>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {step.agent}
                          </p>
                        </div>
                        {status !== 'pending' && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${status === 'completed' ? 'border-green-300 bg-green-50 text-green-700' : 'border-pink-300 bg-pink-50 text-pink-700'}`}
                          >
                            {status === 'completed' ? '✓ Complete' : '⚡ Processing'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                      {status === 'in-progress' && (
                        <div className="space-y-1.5">
                          <Progress value={65} className="h-2" />
                          <p className="text-xs text-gray-500">Processing feedback data...</p>
                        </div>
                      )}
                      {status === 'completed' && step.duration && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed in {step.duration}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Connector */}
                  {index < workflowSteps.length - 1 && (
                    <div className="ml-7 h-6 w-0.5 bg-gradient-to-b from-gray-300 to-gray-200" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Feedback Queue */}
      <Card className="border-0 shadow-2xl shadow-purple-200/50 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#E20074]" />
              Active Feedback Queue
            </span>
            <Badge className="bg-gradient-to-r from-[#E20074] to-[#C4006A] shadow-lg">
              {activeWorkflows.length} Processing
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time feedback being processed by AI agents
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {activeWorkflows.map((item) => {
              const sentimentConfig = getSentimentConfig(item.sentiment);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedWorkflow(item)}
                  className={`p-5 border-2 rounded-xl cursor-pointer transition-all hover:border-[#E20074] hover:shadow-lg ${
                    selectedWorkflow?.id === item.id ? 'border-[#E20074] bg-gradient-to-r from-pink-50 to-purple-50 shadow-lg' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-md">
                        <span className="text-sm">{item.customer.charAt(0)}</span>
                      </div>
                      <div>
                        <span className="text-gray-900">{item.customer}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{item.timestamp}</p>
                      </div>
                    </div>
                    <Badge className={sentimentConfig.className}>
                      {sentimentConfig.icon} {item.sentiment}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E20074]" />
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Zap className="w-4 h-4 text-[#E20074]" />
                      Step {item.currentStep} of {workflowSteps.length}
                    </div>
                  </div>
                  <Progress
                    value={(item.currentStep / workflowSteps.length) * 100}
                    className="h-2"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-xl shadow-purple-200/30 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E20074] to-[#C4006A] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Processed Today</p>
              <p className="text-[#E20074]">1,247</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl shadow-purple-200/30 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Avg. Processing Time</p>
              <p className="text-blue-600">1.8s</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl shadow-purple-200/30 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Accuracy Rate</p>
              <p className="text-green-600">98.5%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl shadow-purple-200/30 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Auto-Resolved</p>
              <p className="text-orange-600">76%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
