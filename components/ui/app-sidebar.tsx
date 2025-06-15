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
import { Input } from "./input";
import { Trash2, Check, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface props {
  setCurrentThreadId: (id: string | null) => void;
  currentThreadId: string | null;
}

export function AppSidebar({ setCurrentThreadId, currentThreadId }: props) {
  const deleteThread = useMutation(api.chat.deleteThread);
  const updateThread = useMutation(api.chat.updateThreadTitle);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDeleteThread = async (threadId: string) => {
    await deleteThread({ threadId: threadId });
    // If we're deleting the current thread, reset to new chat
    if (currentThreadId === threadId) {
      setCurrentThreadId(null);
    }
  };

  const handleDoubleClick = (threadId: string, currentTitle: string) => {
    setEditingThreadId(threadId);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = async () => {
    if (editingThreadId) {
      await updateThread({ threadId: editingThreadId, title: editingTitle });
      setEditingThreadId(null);
      setEditingTitle("");
    }
  };

  const handleCancelEdit = () => {
    setEditingThreadId(null);
    setEditingTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (editingThreadId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingThreadId]);

  const items = useQuery(api.chat.viewAllThreads);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Roach Chat</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="image-gen-button">
                <SidebarMenuButton asChild>
                  <Button variant="link">
                    <Link href={"/image-gen"}>Image Generation</Link>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>

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
                    {editingThreadId === item._id ? (
                      <div className="flex-1 flex items-center gap-2 px-3 py-2">
                        <Input
                          ref={inputRef}
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="flex-1 h-8 text-sm"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 hover:bg-accent rounded transition-colors"
                            title="Save changes"
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 hover:bg-accent rounded transition-colors"
                            title="Cancel editing"
                          >
                            <X className="h-3 w-3 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className={`flex-1 text-left px-3 py-2 text-sm font-medium truncate transition-colors ${
                          currentThreadId === item._id
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setCurrentThreadId(item._id)}
                        onDoubleClick={() =>
                          handleDoubleClick(item._id, item.title || "")
                        }
                      >
                        {item.title}
                      </button>
                    )}
                    {editingThreadId !== item._id && (
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
                    )}
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
