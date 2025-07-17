'use client';

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, AlertCircle, X } from "lucide-react";
import { useEffect, useRef, useState, memo, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  optimisticallySendMessage,
  useThreadMessages,
} from "@convex-dev/agent/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Textarea } from "./ui/textarea";
import ReturnModelIcon from "./model-icon";
import { toast } from 'sonner';

export default function Chat({ threadId }: { threadId: string }) {
  const messageFormSchema = z.object({
    message: z.string().min(1),
  });

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      message: "",
    },
  });
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  const [isAtMessageLimit, setIsAtMessageLimit] = useState(false);
  const currentDate = new Date().toDateString();
  
  //this is temporary until we move into pricing model 
  const MESSAGE_LIMIT = 30;

  const messagesResult = useThreadMessages(
    api.chat.listThreadMessages,
    { threadId: threadId },
    { initialNumItems: 25, stream: true },
  );

  const listAllAvailableModels = useQuery(api.chat.listAllAvailableModels);
  const currentMessageCount = useQuery(api.chat.getCurrentMessageCount, {currentDate});
  const getThreadModelPreference = useQuery(api.chat.getThreadModelPreference, {
    threadId,
  });
  const updateThreadModelPreference = useMutation(
    api.chat.updateThreadModelPreference,
  );
  const sendMessage = useMutation(
    api.chat.streamMessageAsynchronously,
  ).withOptimisticUpdate(
    optimisticallySendMessage(api.chat.listThreadMessages),
  );

  const loadMoreMessages = async () => {
    if (messagesResult.status === "CanLoadMore" && !isLoadingMore) {
      setIsLoadingMore(true);
      try {
        await messagesResult.loadMore(50);
      } catch {
        toast.error("Failed to load message please try again later.");
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [getThreadModelPreference]);

  useEffect(() => {
    if (messagesResult.results.some((x) => x.status === "pending" && x.message?.role !== "user")) 
      {
        setIsThinking(false);
        scrollToBottom();
      }

  }, [messagesResult.results]);

  useEffect(() => {
    if (currentMessageCount && currentMessageCount?.count >= MESSAGE_LIMIT) {
      setShowLimitAlert(true);
      setIsAtMessageLimit(true);
    }
  }, [currentMessageCount]);

  const handleSelectedModel = async (modelName: string) => {
    if (modelName !== "") {
      await updateThreadModelPreference({ threadId, modelName });
    }
  };


  async function sendMessageHandler(values: z.infer<typeof messageFormSchema>) {
    if (!values.message.trim()) return;
    try {
      setIsThinking(true);
      await sendMessage({ threadId, prompt: values.message, currentDate: currentDate });
    } catch {
      setIsThinking(false);
      toast.error("Failed to send message please try again later.");
    }

    form.reset();
  }

  if (messagesResult.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background via-background to-muted/10 flex-1">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col flex-1 min-w-0">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="flex items-center gap-3 p-4 w-full max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden min-w-0">
        <ScrollArea className="h-full">
          <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
            {messagesResult.results.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                <p className="text-muted-foreground max-w-md">
                  Start a conversation by typing a message below. I&apos;m here
                  to help with any questions you have!
                </p>
              </div>
            ) : (
              <>
                {/* Load More Button */}
                {messagesResult.status === "CanLoadMore" && (
                  <div className="flex justify-center pb-4">
                    <Button
                      variant="outline"
                      onClick={loadMoreMessages}
                      disabled={isLoadingMore}
                      className="text-sm"
                    >
                      {isLoadingMore ? "Loading..." : "Load More Messages"}
                    </Button>
                  </div>
                )}

                {messagesResult.results.map((message, i) => (
                  <MemoizedMessageItem
                    key={message.id || `temp-${i}-${message.text?.slice(0, 10) || 'empty'}`}
                    message={message}
                  />
                ))}

                {/* Loading indicator for pending messages */}
                {isThinking ? (
                  <div className="flex gap-3 justify-start">
                    <div className="group max-w-[85%] sm:max-w-[80%] order-2">
                      <div className="rounded-2xl px-4 py-3 shadow-sm bg-card border">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="w-full max-w-4xl mx-auto p-4 relative">
          {/* Daily Limit Alert */}
          {showLimitAlert && (
            <div className="absolute bottom-full left-4 right-4 mb-2 z-50">
              <Alert variant="destructive" className="shadow-lg border-destructive/50 bg-primary/60 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-sm">
                    You&apos;ve reached your daily limit of {MESSAGE_LIMIT.toString()} messages. Try again tomorrow!
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 hover:bg-destructive/20 shrink-0 ml-2"
                    onClick={() => setShowLimitAlert(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(sendMessageHandler)}
              className="flex flex-col sm:flex-row gap-2"
            >
              {/* Model Selector */}
              <div className="w-full sm:w-auto">
                <Select
                  value={getThreadModelPreference}
                  onValueChange={(value) => handleSelectedModel(value)}
                  disabled={isAtMessageLimit}
                >
                  <SelectTrigger className="w-full sm:w-[200px] h-12 bg-background/50 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm">
                    {listAllAvailableModels?.map((model) => (
                      <SelectItem
                        key={model.modelName}
                        value={model.modelName}
                        className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {ReturnModelIcon(model?.provider)}
                          <div className="flex flex-col text-left">
                            <span className="font-medium text-sm">
                              {model.modelDescription}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 flex-1 min-w-0">
                <div className="flex-1 relative min-w-0">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            className="resize-none disabled:opacity-50 disabled:cursor-not-allowed min-w-0"
                            placeholder={isAtMessageLimit ? "Daily message limit reached" : "Type your message...."}
                            disabled={isAtMessageLimit}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  size="icon"
                  disabled={!form.formState.isValid || isAtMessageLimit}
                  className="h-12 w-12 rounded-full shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isAtMessageLimit ? "Daily message limit reached" : "Send message"}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </form>
          </Form>
          
          {/* Daily usage indicator */}
          {currentMessageCount !== undefined && currentMessageCount !== null && (
            <div className="flex justify-center mt-2">
              <span className="text-xs text-muted-foreground">
                Daily messages: {currentMessageCount.count}/{MESSAGE_LIMIT.toString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MemoizedMessageItem = memo(function MessageItem({
  message,
}: {
  message: { id?: string; text?: string; message?: { role: string } };
}) {
  return (
    <div
      className={`flex gap-3 ${
        message.message?.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`group max-w-[85%] sm:max-w-[80%] min-w-0 ${
          message.message?.role === "user" ? "order-1" : "order-2"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm transition-shadow duration-200 min-w-0 ${
            message.message?.role === "user"
              ? "bg-primary text-primary-foreground ml-auto"
              : "bg-card border"
          }`}
        >
          <div className="whitespace-pre-wrap break-words min-w-0">
            <div key={`${message.id}`} className="leading-relaxed">
              <MemoizedMessageContent text={message.text || ""} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const MemoizedMessageContent = memo(function MessageContent({
  text,
}: {
  text: string;
}) {
  const parsedParts = useMemo(() => {
    type MessagePart = {
      type: "text" | "code";
      content: string;
      language?: string;
      key: string;
    };

    const parseMessageText = (text: string): MessagePart[] => {
      const parts: MessagePart[] = [];
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          const textContent = text.slice(lastIndex, match.index);
          if (textContent.trim()) {
            parts.push({
              type: "text",
              content: textContent,
              key: `text-${lastIndex}`,
            });
          }
        }

        const language = match[1] || "text";
        const code = match[2] || "";
        parts.push({
          type: "code",
          content: code,
          language,
          key: `code-${match.index}`,
        });

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < text.length) {
        const textContent = text.slice(lastIndex);
        if (textContent.trim()) {
          parts.push({
            type: "text",
            content: textContent,
            key: `text-${lastIndex}`,
          });
        }
      }

      return parts.length > 0
        ? parts
        : [{ type: "text", content: text, key: "text-0" }];
    };

    return parseMessageText(text);
  }, [text]);

  return (
    <div className="space-y-3 min-w-0">
      {parsedParts.map((part) => {
        if (part.type === "code") {
          return (
            <MemoizedCodeBlock
              key={part.key}
              language={part.language || "text"}
              content={part.content}
            />
          );
        } else {
          return (
            <div
              key={part.key}
              className="prose prose-sm max-w-none prose-neutral dark:prose-invert min-w-0"
            >
              <div className="whitespace-pre-wrap leading-relaxed break-words">
                <ReactMarkdown>{part.content}</ReactMarkdown>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
});

const MemoizedCodeBlock = memo(function CodeBlock({
  language,
  content,
}: {
  language: string;
  content: string;
}) {
  return (
    <div className="not-prose min-w-0">
      <div className="rounded-lg overflow-hidden border border-border/50 bg-muted/30 min-w-0">
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border/30 min-w-0">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide truncate">
            {language}
          </span>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="overflow-x-auto max-w-full">
            <SyntaxHighlighter
              language={language}
              style={darcula}
              customStyle={{
                margin: 0,
                padding: "1rem",
                background: "transparent",
                fontSize: "0.875rem",
                lineHeight: "1.5",
                minWidth: "0",
                wordBreak: "break-all" as const,
              }}
              codeTagProps={{
                style: {
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  wordBreak: "break-all" as const,
                },
              }}
              wrapLongLines={true}
            >
              {content.trim()}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
});

