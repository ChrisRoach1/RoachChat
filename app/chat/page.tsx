"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Bot, Sparkles } from "lucide-react";
import { useState } from "react";
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
import Image from "next/image";
import ReturnModelIcon from "@/components/model-icon";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

export default function ChatPage() {
  const messageFormSchema = z.object({
    threadTitle: z.string().min(1),
    selectedModel: z.string().min(1),
  });

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      threadTitle: "",
      selectedModel: "",
    },
  });

  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const [threadId, setThreadId] = useState<string | null>(searchParams.get("thread"));
  const createThread = useAction(api.chat.createThread);
  const listAllAvailableModels = useQuery(api.chat.listAllAvailableModels);

  if (!useAuth().isSignedIn) {
    router.push("/");
  }

  const handleCreateThread = async (
    values: z.infer<typeof messageFormSchema>,
  ) => {
    if (!values.threadTitle.trim() || !values.selectedModel) return;

    try {
      const { threadId: newThreadId } = await createThread({
        title: values.threadTitle.trim(),
        modelName: values.selectedModel,
      });
      setThreadId(newThreadId);
      router.push(pathName + "?thread=" + newThreadId);
    } catch {
      toast.error("Failed to create thread please try again later.");
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

  return (
    <SidebarProvider>
      <AppSidebar
        setCurrentThreadId={handleSetThreadId}
        currentThreadId={threadId}
      />
      <SidebarTrigger />

      {!(threadId !== null && threadId !== "") ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-background via-background to-muted/10 flex-1">
          <div className="text-center max-w-lg w-full px-6">
            {/* Hero Section */}
            <div className="relative mb-8 flex justify-center items-center">
              <Image src={"image.svg"} alt="My SVG" width={250} height={250} />
            </div>

            <div className="space-y-4 mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Welcome to Roach Chat
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Start a new conversation with our helpful little artificial
                roach. Choose your preferred model and give your thread a title
                to begin!
              </p>
            </div>

            <Form {...form}>
              {/* Create Thread Form */}
              <form
                onSubmit={form.handleSubmit(handleCreateThread)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="selectedModel"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Bot className="h-4 w-4" />
                        <FormLabel>Choose AI Model</FormLabel>
                      </div>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full h-12 text-left bg-background/50 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="Select an AI model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-background/95 backdrop-blur-sm">
                          {listAllAvailableModels?.map((model) => (
                            <SelectItem
                              key={model.modelName}
                              value={model.modelName}
                              className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
                            >
                              <div className="flex items-center gap-3">
                                {ReturnModelIcon(model.provider)}
                                <div className="flex flex-col text-left">
                                  <span className="font-medium">
                                    {model.modelDescription}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Thread Title Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    <span>Thread Title</span>
                  </div>
                  <FormField
                    control={form.control}
                    name="threadTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            maxLength={100}
                            placeholder="Enter a descriptive title for your conversation..."
                            className="h-12 text-center border-2 focus:border-primary/50 hover:border-primary/50 transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Create Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-base font-medium"
                  disabled={!form.formState.isValid}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Create Thread
                </Button>
              </form>
            </Form>
          </div>
        </div>
      ) : (
        <Chat threadId={threadId} />
      )}
    </SidebarProvider>
  );
}
