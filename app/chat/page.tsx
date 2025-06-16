"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Bot, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Chat from "@/components/Chat";
import { useAction, useQuery } from "convex/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ChatPage() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threadTitle, setThreadTitle] = useState("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const createThread = useAction(api.chat.createThread);
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const listAllAvailableModels = useQuery(api.chat.listAllAvailableModels);

  useEffect(() => {
    const threadFromUrl = searchParams.get("thread");
    if (threadFromUrl) {
      setThreadId(threadFromUrl);
    }
  }, [searchParams]);


  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadTitle.trim() || !selectedModel) return;

    setIsCreating(true);
    try {
      const { threadId: newThreadId } = await createThread({
        title: threadTitle.trim(),
        modelName: selectedModel
      });
      setThreadId(newThreadId);
      router.push(pathName + "?thread=" + newThreadId);
      setThreadTitle("");
    } catch (error) {
      console.error("Failed to create thread:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSetThreadId = (id: string | null) => {
    if (id !== threadId) {
      if (id === null) {
        router.push(pathName);
      } else {
        router.push(pathName + "?thread=" + id);
      }
      setThreadId(id);
    }
  };

  const getModelDisplayName = (modelName: string) => {
    const modelInfo = listAllAvailableModels?.find(model => model.modelName === modelName);
    return modelInfo?.modelDescription || modelName;
  };

  // Show loading state while models are being fetched or seeded
  // if (listAllAvailableModels === undefined) {
  //   return (
  //     <SidebarProvider>
  //       <AppSidebar setCurrentThreadId={handleSetThreadId} currentThreadId={threadId} />
  //       <SidebarTrigger />
  //       <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background via-background to-muted/10 flex-1">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
  //           <p className="text-muted-foreground">Loading available models...</p>
  //         </div>
  //       </div>
  //     </SidebarProvider>
  //   );
  // }

  return (
    <SidebarProvider>
      <AppSidebar
        setCurrentThreadId={handleSetThreadId}
        currentThreadId={threadId}/>
      <SidebarTrigger />

      {!(threadId !== null && threadId !== "") ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background via-background to-muted/10 flex-1">
          <div className="text-center max-w-lg w-full px-6">
            {/* Hero Section */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
              <div className="relative rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-8 mb-6 backdrop-blur-sm border border-primary/10">
                <MessageCircle className="h-20 w-20 text-primary mx-auto" />
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Welcome to Roach Chat
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Start a new conversation with our AI assistant. Choose your preferred model and give your thread a title to begin!
              </p>
            </div>

            {/* Create Thread Form */}
            <form onSubmit={handleCreateThread} className="space-y-6">
              {/* Model Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Bot className="h-4 w-4" />
                  <span>Choose AI Model</span>
                </div>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-full h-12 text-left bg-background/50 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select an AI model" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm">
                    {listAllAvailableModels?.map((model) => (
                      <SelectItem
                        key={model.modelName}
                        value={model.modelName}
                        className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                          <div className="flex flex-col text-left">
                            <span className="font-medium">{model.modelDescription}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Thread Title Input */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>Thread Title</span>
                </div>
                <Input
                  value={threadTitle}
                  onChange={(e) => setThreadTitle(e.target.value)}
                  placeholder="Enter a descriptive title for your conversation..."
                  className="h-12 text-center bg-background/50 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-base"
                  maxLength={100}
                />
              </div>

              {/* Create Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-base font-medium"
                disabled={!threadTitle.trim() || !selectedModel || isCreating}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {isCreating ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
                    Creating Thread...
                  </span>
                ) : (
                  "Create Thread"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-xs text-muted-foreground">
              <p>Selected Model: <span className="font-medium text-foreground">{selectedModel ? getModelDisplayName(selectedModel) : 'None'}</span></p>
            </div>
          </div>
        </div>
      ) : (
        <Chat threadId={threadId} />
      )}
    </SidebarProvider>
  );
}


