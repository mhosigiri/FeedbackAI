import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, MessageSquare, Users, Clock } from 'lucide-react';

interface FeedbackData {
  id: number;
  name: string;
  email: string;
  phone: string;
  sentiment: string;
  category: string;
  feedback: string;
  date: string;
  time: string;
}

export function EmployeeDashboard() {
  // Mock feedback data
  const feedbackData: FeedbackData[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 123-4567',
      sentiment: 'negative',
      category: 'Network Coverage',
      feedback: 'The network coverage in downtown area is very poor. I frequently experience dropped calls and slow data speeds.',
      date: '2025-11-08',
      time: '09:15 AM',
    },
    {
      id: 2,
      name: 'Mike Thompson',
      email: 'mike.t@email.com',
      phone: '(555) 234-5678',
      sentiment: 'positive',
      category: 'Customer Service',
      feedback: 'The customer service representative was extremely helpful and resolved my billing issue quickly. Great experience!',
      date: '2025-11-08',
      time: '10:30 AM',
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      email: 'emma.r@email.com',
      phone: '(555) 345-6789',
      sentiment: 'neutral',
      category: 'Billing',
      feedback: 'My bill was higher than expected this month. Would like clarification on some charges.',
      date: '2025-11-08',
      time: '11:45 AM',
    },
    {
      id: 4,
      name: 'James Chen',
      email: 'james.c@email.com',
      phone: '(555) 456-7890',
      sentiment: 'very-positive',
      category: 'Store Experience',
      feedback: 'Visited the store for a phone upgrade. Staff was knowledgeable and patient. Best retail experience I have had!',
      date: '2025-11-08',
      time: '01:20 PM',
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      email: 'lisa.a@email.com',
      phone: '(555) 567-8901',
      sentiment: 'positive',
      category: 'Mobile App',
      feedback: 'The new app update makes it much easier to manage my account and pay bills. Love the interface!',
      date: '2025-11-08',
      time: '02:10 PM',
    },
    {
      id: 6,
      name: 'David Martinez',
      email: 'david.m@email.com',
      phone: '(555) 678-9012',
      sentiment: 'negative',
      category: 'Pricing & Plans',
      feedback: 'The pricing increased without proper notification. Not happy about the sudden change to my plan.',
      date: '2025-11-07',
      time: '03:45 PM',
    },
    {
      id: 7,
      name: 'Jennifer Lee',
      email: 'jennifer.l@email.com',
      phone: '(555) 789-0123',
      sentiment: 'positive',
      category: 'Device & Equipment',
      feedback: 'Received my new phone quickly and the trade-in process was seamless. Very satisfied!',
      date: '2025-11-07',
      time: '04:30 PM',
    },
    {
      id: 8,
      name: 'Robert Wilson',
      email: 'robert.w@email.com',
      phone: '(555) 890-1234',
      sentiment: 'very-negative',
      category: 'Customer Service',
      feedback: 'Was on hold for over an hour and still did not get my issue resolved. Extremely frustrated with the service.',
      date: '2025-11-07',
      time: '05:15 PM',
    },
  ];

  // Sentiment distribution data
  const sentimentData = [
    { name: 'Very Positive', value: 12, color: '#10b981' },
    { name: 'Positive', value: 35, color: '#6ee7b7' },
    { name: 'Neutral', value: 18, color: '#fbbf24' },
    { name: 'Negative', value: 25, color: '#fb923c' },
    { name: 'Very Negative', value: 10, color: '#ef4444' },
  ];

  // Category distribution data
  const categoryData = [
    { category: 'Network Coverage', count: 45 },
    { category: 'Customer Service', count: 38 },
    { category: 'Billing', count: 32 },
    { category: 'Pricing & Plans', count: 28 },
    { category: 'Device & Equipment', count: 22 },
    { category: 'Store Experience', count: 18 },
    { category: 'Mobile App', count: 15 },
    { category: 'Other', count: 12 },
  ];

  // Trends over time data
  const trendsData = [
    { date: 'Nov 1', feedback: 42 },
    { date: 'Nov 2', feedback: 38 },
    { date: 'Nov 3', feedback: 45 },
    { date: 'Nov 4', feedback: 52 },
    { date: 'Nov 5', feedback: 48 },
    { date: 'Nov 6', feedback: 55 },
    { date: 'Nov 7', feedback: 61 },
    { date: 'Nov 8', feedback: 68 },
  ];

  // Top keywords data
  const keywordsData = [
    { keyword: 'network', count: 89 },
    { keyword: 'coverage', count: 76 },
    { keyword: 'billing', count: 68 },
    { keyword: 'service', count: 64 },
    { keyword: 'helpful', count: 52 },
    { keyword: 'slow', count: 48 },
    { keyword: 'expensive', count: 45 },
    { keyword: 'excellent', count: 42 },
    { keyword: 'upgrade', count: 38 },
    { keyword: 'issue', count: 35 },
  ];

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'very-positive':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Very Positive</Badge>;
      case 'positive':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Positive</Badge>;
      case 'neutral':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Neutral</Badge>;
      case 'negative':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Negative</Badge>;
      case 'very-negative':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Very Negative</Badge>;
      default:
        return <Badge>{sentiment}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E20074] to-[#C4006A] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Feedback</p>
              <p className="text-[#E20074]">1,247</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Positive Rate</p>
              <p className="text-green-600">47%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Active Users</p>
              <p className="text-blue-600">892</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
              <p className="text-orange-600">2.3h</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Customer feedback sentiment breakdown</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="48%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ fontSize: '15px' }}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
            <CardTitle>Feedback by Category</CardTitle>
            <CardDescription>Distribution across different categories</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#E20074" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feedback Trends */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
            <CardTitle>Feedback Trends</CardTitle>
            <CardDescription>Daily feedback volume over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="feedback" stroke="#E20074" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Keywords */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
            <CardTitle>Top Keywords</CardTitle>
            <CardDescription>Most frequently mentioned terms</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={keywordsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="keyword" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Table */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
          <CardTitle>Recent Feedback Submissions</CardTitle>
          <CardDescription>All customer feedback submissions</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="border rounded-lg overflow-auto max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[60px] sticky top-0 bg-white z-10">ID</TableHead>
                  <TableHead className="min-w-[150px] sticky top-0 bg-white z-10">Customer</TableHead>
                  <TableHead className="min-w-[200px] sticky top-0 bg-white z-10">Contact</TableHead>
                  <TableHead className="min-w-[140px] sticky top-0 bg-white z-10">Sentiment</TableHead>
                  <TableHead className="min-w-[150px] sticky top-0 bg-white z-10">Category</TableHead>
                  <TableHead className="min-w-[500px] sticky top-0 bg-white z-10">Feedback</TableHead>
                  <TableHead className="min-w-[140px] sticky top-0 bg-white z-10">Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="min-w-[60px]">{item.id}</TableCell>
                    <TableCell className="min-w-[150px]">
                      <div>
                        <p className="whitespace-nowrap">{item.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[200px]">
                      <div className="text-sm">
                        <p className="text-gray-600">{item.email}</p>
                        <p className="text-gray-500 whitespace-nowrap">{item.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[140px]">{getSentimentBadge(item.sentiment)}</TableCell>
                    <TableCell className="min-w-[150px]">
                      <Badge variant="outline" className="whitespace-nowrap">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="min-w-[500px]">
                      <p className="text-sm text-gray-600">{item.feedback}</p>
                    </TableCell>
                    <TableCell className="min-w-[140px]">
                      <div className="text-sm">
                        <p className="text-gray-900 whitespace-nowrap">{item.date}</p>
                        <p className="text-gray-500 whitespace-nowrap">{item.time}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
