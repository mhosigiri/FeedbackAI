import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Send, Bot, User, Heart } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! 👋 I'm your T-Mobile AI assistant, and I'm so happy to help you today!\n\nI can assist you with:\n\n💡 Network coverage questions\n💰 Billing inquiries\n📱 Plan upgrades\n💬 Submitting feedback\n\nWhat can I do for you?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('feedback') || lowerMessage.includes('complaint') || lowerMessage.includes('issue')) {
      return "I'd be happy to help you submit feedback! I'll guide you through a quick process. First, how would you rate your overall experience - very negative, negative, neutral, positive, or very positive?";
    }
    
    if (lowerMessage.includes('coverage') || lowerMessage.includes('network') || lowerMessage.includes('signal')) {
      return "I can help with network coverage questions. T-Mobile has expanded 5G coverage to over 330 million people nationwide. Are you experiencing specific coverage issues in your area?";
    }
    
    if (lowerMessage.includes('bill') || lowerMessage.includes('payment') || lowerMessage.includes('charge')) {
      return "For billing inquiries, I can help you understand your charges or set up a payment plan. What specific billing question do you have?";
    }
    
    if (lowerMessage.includes('plan') || lowerMessage.includes('upgrade') || lowerMessage.includes('change')) {
      return "Looking to upgrade your plan? T-Mobile offers several options including Magenta, Magenta MAX, and business plans. What features are most important to you?";
    }
    
    if (lowerMessage.includes('positive') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
      return "That's wonderful to hear! 🎉 We appreciate your positive feedback. Would you like to share specific details about what made your experience great? This helps us recognize our team members.";
    }
    
    if (lowerMessage.includes('negative') || lowerMessage.includes('bad') || lowerMessage.includes('poor')) {
      return "I'm sorry to hear about your experience. 😔 Your feedback is important to us. I'm escalating this to our priority support team. Can you provide more details about what happened?";
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! 😊 Is there anything else I can help you with today?";
    }
    
    return "I understand. Let me connect you with the right resources. You can also submit detailed feedback through our feedback form, and our AI agents will route it to the appropriate department for review.";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking and response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="w-full h-[700px] flex flex-col border-0 shadow-2xl shadow-purple-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-50 to-purple-50">
        <CardTitle className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#E20074] to-[#C4006A] rounded-2xl flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div>
              T-Mobile AI Assistant
            </div>
            <p className="text-xs text-gray-500 mt-1">Online • Here to help you!</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className="w-10 h-10 shadow-md">
                  <AvatarFallback className={message.sender === 'bot' ? 'bg-gradient-to-br from-[#E20074] to-[#C4006A]' : 'bg-gradient-to-br from-gray-400 to-gray-500'}>
                    {message.sender === 'bot' ? (
                      <Bot className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-2xl px-5 py-3 max-w-[80%] shadow-md ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-[#E20074] to-[#C4006A] text-white'
                      : 'bg-white border border-gray-100'
                  }`}
                >
                  <p className={`whitespace-pre-line ${message.sender === 'bot' ? 'text-gray-800' : ''}`}>{message.text}</p>
                  <span className={`text-xs opacity-70 mt-2 block ${message.sender === 'bot' ? 'text-gray-500' : ''}`}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="w-10 h-10 shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-[#E20074] to-[#C4006A]">
                    <Bot className="w-5 h-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl px-5 py-3 bg-white border border-gray-100 shadow-md">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-[#E20074] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-[#E20074] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-[#E20074] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-pink-50/50 to-purple-50/50">
          <div className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-white border-gray-200 focus:border-[#E20074] focus:ring-[#E20074] h-12"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="bg-gradient-to-r from-[#E20074] to-[#C4006A] hover:from-[#C4006A] hover:to-[#A00058] shadow-lg shadow-pink-300/50 h-12 w-12 p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
