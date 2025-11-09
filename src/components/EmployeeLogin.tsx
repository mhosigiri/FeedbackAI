import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ArrowLeft, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface EmployeeLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export function EmployeeLogin({ onLoginSuccess, onBack }: EmployeeLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication
    setTimeout(() => {
      // Mock credentials for demo purposes
      if (email === 'employee@tmobile.com' && password === 'tmobile2025') {
        toast.success('Login successful!', {
          description: 'Welcome to the Employee Dashboard',
        });
        onLoginSuccess();
      } else {
        toast.error('Invalid credentials', {
          description: 'Please check your email and password',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white relative overflow-hidden flex items-center justify-center">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#E20074] opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-300 opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 gap-2 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Customer Portal
          </Button>

          {/* Login Card */}
          <Card className="border-0 shadow-2xl shadow-purple-200/50 bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#E20074] to-[#C4006A] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-300/50">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <CardTitle>Employee Login</CardTitle>
              <CardDescription>
                Access the T-Mobile Analytics Dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="employee@tmobile.com"
                    required
                    className="bg-white border-gray-200 focus:border-[#E20074] focus:ring-[#E20074]"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-gray-900 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-white border-gray-200 focus:border-[#E20074] focus:ring-[#E20074]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#E20074] to-[#C4006A] hover:from-[#C4006A] hover:to-[#A00058] shadow-lg shadow-pink-300/50 h-12"
                >
                  {isLoading ? 'Logging in...' : 'Login to Dashboard'}
                </Button>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Demo Credentials:</strong>
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Email: employee@tmobile.com
                  </p>
                  <p className="text-sm text-blue-700">
                    Password: tmobile2025
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
