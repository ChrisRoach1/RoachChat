"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Bot, Send } from "lucide-react";
import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, status } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen flex-col flex-1">
      {/* Messages - takes up remaining space */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="rounded-full bg-primary/10 p-6 mb-4">
                  <Bot className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  Welcome to AI Chat
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Start a conversation by typing a message below. I&apos;m here
                  to help with any questions you have!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`group max-w-[80%] ${
                      message.role === "user" ? "order-1" : "order-2"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-card border"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case "text":
                              return (
                                <div
                                  key={`${message.id}-${i}`}
                                  className="leading-relaxed"
                                >
                                  {part.text}
                                </div>
                              );
                            default:
                              return null;
                          }
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {status !== "ready" && status !== "streaming" && (
              <div className="flex gap-3 justify-start">
                <div className="bg-card border rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input - fixed at bottom */}
      <div className="border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={input}
                placeholder="Type your message..."
                onChange={handleInputChange}
                className="pr-12 h-12 rounded-full border-2 focus:border-primary/50 transition-colors"
                disabled={status !== "ready"}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 rounded-full shrink-0"
              disabled={status !== "ready" || !input.trim()}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
