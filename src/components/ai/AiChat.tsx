"use client";

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAiAssistantResponse, getFullAiAssistantResponse } from '@/app/actions';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendedProducts?: Product[];
}

export default function AiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const assistantResponse = await getFullAiAssistantResponse(input);
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: assistantResponse.answer,
        recommendedProducts: assistantResponse.recommendedProducts
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I couldn't get a response. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen(true)}
        aria-label="Open AI Chat"
      >
        <Bot className="h-7 w-7" />
      </Button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-lg p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              AI Shopping Assistant
            </SheetTitle>
             <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </SheetClose>
          </SheetHeader>
          <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                  <Bot className="mx-auto h-12 w-12 mb-4" />
                  <p>Welcome! How can I help you shop today? Ask me about products, recommendations, or anything else!</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><Bot size={20}/></AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 max-w-xs md:max-w-md">
                    <div
                      className={cn(
                        'rounded-lg p-3 text-sm',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-secondary'
                      )}
                    >
                      {message.content}
                    </div>
                    
                    {/* Display product recommendations for assistant messages */}
                    {message.role === 'assistant' && message.recommendedProducts && message.recommendedProducts.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Recommended products:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {message.recommendedProducts.slice(0, 3).map((product, productIndex) => (
                            <Link 
                              key={productIndex} 
                              href={`/products/${product.id}`}
                              className="flex items-center gap-2 p-2 rounded-lg border hover:bg-secondary/50 transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{product.name}</p>
                                <p className="text-xs text-muted-foreground">${product.price.toFixed(2)}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        {message.recommendedProducts.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{message.recommendedProducts.length - 3} more products
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                   {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><Bot size={20}/></AvatarFallback>
                    </Avatar>
                    <div className="bg-secondary rounded-lg p-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <SheetFooter className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a product..."
                className="flex-grow"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
