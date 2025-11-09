import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AngryIcon as Angry, FrownIcon as Frown, MehIcon as Meh, SmileIcon as Smile, LaughIcon as Laugh, Send, Heart } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function FeedbackForm() {
  const [sentiment, setSentiment] = useState('');
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate feedback is required when category is "other"
    if (category === 'other' && !feedback.trim()) {
      toast.error('Please provide feedback details for "Other" category');
      return;
    }
    
    toast.success('Thank you! 💖 Your feedback has been received!', {
      description: 'Our AI team is reviewing your input. We\'ll be in touch soon!',
    });
    
    // Reset form
    setSentiment('');
    setCategory('');
    setName('');
    setEmail('');
    setPhone('');
    setFeedback('');
  };

  const sentimentOptions = [
    { 
      value: 'very-negative', 
      label: 'Very Negative', 
      icon: Angry, 
      color: 'text-red-600',
      bgHover: 'hover:bg-red-50',
      bgActive: 'peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-red-50 peer-data-[state=checked]:to-red-100',
      borderActive: 'peer-data-[state=checked]:border-red-500',
      emoji: '😡'
    },
    { 
      value: 'negative', 
      label: 'Negative', 
      icon: Frown, 
      color: 'text-orange-500',
      bgHover: 'hover:bg-orange-50',
      bgActive: 'peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-orange-50 peer-data-[state=checked]:to-orange-100',
      borderActive: 'peer-data-[state=checked]:border-orange-500',
      emoji: '😞'
    },
    { 
      value: 'neutral', 
      label: 'Neutral', 
      icon: Meh, 
      color: 'text-yellow-500',
      bgHover: 'hover:bg-yellow-50',
      bgActive: 'peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-yellow-50 peer-data-[state=checked]:to-yellow-100',
      borderActive: 'peer-data-[state=checked]:border-yellow-500',
      emoji: '😐'
    },
    { 
      value: 'positive', 
      label: 'Positive', 
      icon: Smile, 
      color: 'text-green-500',
      bgHover: 'hover:bg-green-50',
      bgActive: 'peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-green-50 peer-data-[state=checked]:to-green-100',
      borderActive: 'peer-data-[state=checked]:border-green-500',
      emoji: '😊'
    },
    { 
      value: 'very-positive', 
      label: 'Very Positive', 
      icon: Laugh, 
      color: 'text-emerald-600',
      bgHover: 'hover:bg-emerald-50',
      bgActive: 'peer-data-[state=checked]:bg-gradient-to-br peer-data-[state=checked]:from-emerald-50 peer-data-[state=checked]:to-emerald-100',
      borderActive: 'peer-data-[state=checked]:border-emerald-500',
      emoji: '😄'
    },
  ];

  return (
    <Card className="w-full border-0 shadow-2xl shadow-purple-200/50 bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-[#E20074] fill-[#E20074]" />
          Share Your T-Mobile Experience
        </CardTitle>
        <CardDescription>
          Every detail matters to us. Tell us how we can serve you better!
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Information - Moved to top */}
          <div className="space-y-6 p-6 rounded-xl bg-gradient-to-br from-pink-50/50 to-purple-50/50 border border-pink-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E20074] to-[#C4006A] flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
              <h3 className="text-gray-900">Your Contact Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-gray-900">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="bg-white border-gray-200 focus:border-[#E20074] focus:ring-[#E20074]"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-gray-900">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  required
                  className="bg-white border-gray-200 focus:border-[#E20074] focus:ring-[#E20074]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-gray-900">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="bg-white border-gray-200 focus:border-[#E20074] focus:ring-[#E20074]"
              />
            </div>
          </div>

          {/* Sentiment Selection */}
          <div className="space-y-4">
            <Label className="text-gray-900">
              How do you feel about T-Mobile?
            </Label>
            <RadioGroup value={sentiment} onValueChange={setSentiment} className="grid grid-cols-5 gap-3">
              {sentimentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.value}>
                    <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                    <Label
                      htmlFor={option.value}
                      className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-gray-200 p-4 cursor-pointer transition-all ${option.bgHover} ${option.bgActive} ${option.borderActive} hover:shadow-lg hover:scale-105`}
                    >
                      <Icon className={`w-10 h-10 ${option.color}`} strokeWidth={1.5} />
                      <span className="text-xs text-center text-gray-700">{option.label}</span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Category Selection */}
          <div className="space-y-3">
            <Label htmlFor="category" className="text-gray-900">What would you like to share about?</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="bg-white border-gray-200 focus:border-[#E20074] focus:ring-[#E20074]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="network">Network Coverage</SelectItem>
                <SelectItem value="customer-service">Customer Service</SelectItem>
                <SelectItem value="pricing">Pricing & Plans</SelectItem>
                <SelectItem value="device">Device & Equipment</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="store">Store Experience</SelectItem>
                <SelectItem value="app">Mobile App</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback Text */}
          <div className="space-y-3">
            <Label htmlFor="feedback" className="text-gray-900">
              Your Feedback
              {category === 'other' && <span className="text-red-500"> *</span>}
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience with T-Mobile... We're all ears! 👂"
              className="min-h-32 bg-white border-gray-200 focus:border-[#E20074] focus:ring-[#E20074] resize-none"
              required={category === 'other'}
            />
            <p className="text-xs text-gray-500">
              💡 The more details you share, the better we can help you!
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#E20074] to-[#C4006A] hover:from-[#C4006A] hover:to-[#A00058] shadow-lg shadow-pink-300/50 h-12 gap-2"
          >
            <Send className="w-4 h-4" />
            Send Your Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
