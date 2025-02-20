import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Message } from '@shared/schema';

interface ChatInterfaceProps {
  onLocationSelect: (location: string) => void;
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
    mutationFn: async (message: string) => {
      try {
        const response = await apiRequest('POST', '/api/chat', { message });
        const data = await response.json();
        if (!response.ok) {
          const errorMessage = data.error || 'Failed to send message';
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive"
          });
          throw new Error(errorMessage);
        }
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, data.message]);
      if (data.location) {
        onLocationSelect(data.location);
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
    <Card className="h-[600px] flex flex-col bg-white/50 backdrop-blur-sm border-none shadow-lg">
      <div className="p-4 border-b bg-primary/5">
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
                className={`max-w-[80%] rounded-lg p-3 transition-all duration-200 animate-in slide-in-from-bottom-2 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-muted/50 backdrop-blur-sm mr-4'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-muted/50 backdrop-blur-sm mr-4 max-w-[80%] rounded-lg p-3">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-white/50">
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
            className="bg-white/50 border-primary/20 focus:border-primary/40"
            disabled={chatMutation.isPending}
          />
          <Button
            type="submit"
            variant="default"
            className="bg-primary hover:bg-primary/90 transition-colors"
            disabled={chatMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}