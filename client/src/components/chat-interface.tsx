import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Message } from '@shared/schema';
import WeatherCard from './weather-card';
import CulturalInfoCard from './cultural-info-card';
import SearchHistory from './search-history';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChatInterfaceProps {
  onLocationSelect: (location: string, category?: string) => void;
}

interface ChatResponse {
  message: Message;
  location?: string | null;
  category?: string | null;
  translations?: Record<string, string>;
}

const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'ja': '日本語',
  'ko': '한국어',
  'zh': '中文'
};

export default function ChatInterface({ onLocationSelect }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [searchHistory, setSearchHistory] = useState<Array<{
    query: string;
    timestamp: Date;
  }>>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your travel assistant. I can help you discover places to visit and find travel information. Where would you like to explore?",
      timestamp: Date.now()
    }
  ]);

  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string): Promise<ChatResponse> => {
      try {
        const response = await apiRequest('POST', '/api/chat', {
          message,
          language: selectedLanguage
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to send message');
        }
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.translations?.[selectedLanguage] || data.message.content,
        timestamp: Date.now()
      }]);

      setSearchHistory(prev => [{
        query: input,
        timestamp: new Date()
      }, ...prev]);

      if (data.location) {
        setCurrentLocation(data.location);
        onLocationSelect(data.location, data.category);
      }
    },
    onError: (error: Error) => {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input.trim());
    setInput('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-3 space-y-4">
        <Card className="h-[600px] flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Travel Assistant</h2>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <Select
                  value={selectedLanguage}
                  onValueChange={setSelectedLanguage}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-muted mr-4'
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-muted mr-4 max-w-[80%] rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Finding the best recommendations for you...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Where would you like to go?"
                className="flex-1"
                disabled={chatMutation.isPending}
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full w-10 h-10"
                disabled={chatMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        {currentLocation && (
          <div className="space-y-4 animate-in fade-in duration-700">
            <WeatherCard location={currentLocation} />
            <CulturalInfoCard location={currentLocation} />
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <SearchHistory
          searchQueries={searchHistory}
          onLocationSelect={onLocationSelect}
        />
      </div>
    </div>
  );
}