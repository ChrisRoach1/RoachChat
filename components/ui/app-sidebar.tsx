"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { SignedIn, UserButton } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { Button } from "./button";
import { Trash2 } from "lucide-react";

interface props {
  setCurrentThreadId: (id: string | null) => void;
  currentThreadId: string | null;
}

export function AppSidebar({
  setCurrentThreadId,
  currentThreadId }: props) {
  const deleteThread = useMutation(api.chat.deleteThread);
  const handleDeleteThread = async (threadId: string) => {
    await deleteThread({ threadId: threadId });
    // If we're deleting the current thread, reset to new chat
    if (currentThreadId === threadId) {
      setCurrentThreadId(null);
    }
  };

  const items = useQuery(api.chat.viewAllThreads);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Roach Chat</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="new-chat-button">
                <SidebarMenuButton asChild>
                  <Button
                    variant="default"
                    onClick={() => setCurrentThreadId(null)}
                  >
                    Start New chat
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {items?.page.map((item) => (
                <SidebarMenuItem key={item._id}>
                  <div className="flex items-center group hover:bg-accent rounded-md">
                    <button
                      className={`flex-1 text-left px-3 py-2 text-sm font-medium truncate transition-colors ${
                        currentThreadId === item._id
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setCurrentThreadId(item._id)}
                    >
                      {item.title}
                    </button>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 mr-2 hover:bg-destructive/10 rounded transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteThread(item._id);
                      }}
                      title="Delete thread"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="p-2">
              <SignedIn>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors">
                  <UserButton
                  
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                      },
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      Welcome back!
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Manage your account
                    </div>
                  </div>
                </div>
              </SignedIn>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
