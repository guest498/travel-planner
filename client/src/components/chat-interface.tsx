import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, MapPin, Sun, Globe, Train } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Message } from '@shared/schema';

interface ChatInterfaceProps {
  onLocationSelect: (location: string, category?: string) => void;
}

interface ChatResponse {
  message: Message;
  category?: string;
  location?: string;
  images?: string[];
}

export default function ChatInterface({ onLocationSelect }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
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
        const response = await apiRequest('POST', '/api/chat', { message });
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
      const messageContent = data.images?.length 
        ? `${data.message.content}\n\n[Images Available]` 
        : data.message.content;

      setMessages(prev => [...prev, {
        ...data.message,
        content: messageContent
      }]);

      if (data.location) {
        onLocationSelect(data.location, data.category);
      }

      // Display images in a separate message if available
      if (data.images?.length) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.images!.map(url => `<img src="${url}" alt="Place" class="rounded-lg max-w-full h-auto my-2" />`).join('\n'),
          timestamp: Date.now()
        }]);
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

  // Helper function to get message icon based on content
  const getMessageIcon = (content: string) => {
    if (content.toLowerCase().includes('weather')) return <Sun className="h-4 w-4" />;
    if (content.toLowerCase().includes('location') || content.toLowerCase().includes('place')) return <MapPin className="h-4 w-4" />;
    if (content.toLowerCase().includes('culture') || content.toLowerCase().includes('language')) return <Globe className="h-4 w-4" />;
    if (content.toLowerCase().includes('transport') || content.toLowerCase().includes('travel')) return <Train className="h-4 w-4" />;
    return null;
  };

  return (
    <Card className="h-[600px] flex flex-col bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-lg border-none shadow-xl rounded-xl overflow-hidden">
      <div className="p-4 border-b bg-white/10 backdrop-blur-sm">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Travel Assistant
        </h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 shadow-sm transition-all duration-200 animate-in slide-in-from-bottom-2 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-white/80 backdrop-blur-sm mr-4'
                }`}
              >
                <div className="flex items-start gap-2">
                  {msg.role === 'assistant' && getMessageIcon(msg.content)}
                  <div className="prose prose-sm">
                    {msg.content.includes('<img') ? (
                      <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white/80 backdrop-blur-sm mr-4 max-w-[80%] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Finding the best recommendations for you...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-white/10 backdrop-blur-sm">
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
            className="bg-white/50 border-primary/20 focus:border-primary/40 rounded-xl"
            disabled={chatMutation.isPending}
          />
          <Button
            type="submit"
            variant="default"
            size="icon"
            className="bg-primary hover:bg-primary/90 transition-colors rounded-xl w-12 h-12 flex-shrink-0"
            disabled={chatMutation.isPending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </Card>
  );
}