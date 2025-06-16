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
import { Trash2, Check, X, Folder, Plus, GripVertical } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface props {
  setCurrentThreadId: (id: string | null) => void;
  currentThreadId: string | null;
}

interface Folder {
  id: string;
  name: string;
  threadIds: string[];
}

interface DraggableThreadProps {
  thread: {
    _id: string;
    title?: string;
  };
  onDoubleClick: (threadId: string, title: string) => void;
  onDelete: (threadId: string) => void;
  currentThreadId: string | null;
  setCurrentThreadId: (id: string | null) => void;
  editingThreadId: string | null;
  editingTitle: string;
  setEditingTitle: (title: string) => void;
  handleSaveEdit: () => void;
  handleCancelEdit: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

interface DroppableFolderProps {
  folderId: string;
  folderName: string;
  threadCount: number;
  onDelete: (folderId: string) => void;
}

function DroppableFolder({ folderId, folderName, threadCount, onDelete }: DroppableFolderProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: folderId,
  });

  return (
    <div className="group">
      <AccordionTrigger 
        className={`px-3 py-2 hover:bg-accent rounded-md transition-colors ${
          isOver ? 'bg-primary/10 border-2 border-primary border-dashed' : ''
        }`}
        ref={setNodeRef}
      >
        <div className="flex items-center gap-2 flex-1">
          <Folder className="h-4 w-4" />
          <span className="text-sm">{folderName}</span>
          <span className="text-xs text-muted-foreground">
            ({threadCount})
          </span>
        </div>
      </AccordionTrigger>
      <button
        className="absolute right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all z-10"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(folderId);
        }}
        title="Delete folder"
      >
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </button>
    </div>
  );
}

interface DroppableUnorganizedProps {
  children: React.ReactNode;
}

function DroppableUnorganized({ children }: DroppableUnorganizedProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "unorganized",
  });

  return (
    <div 
      ref={setNodeRef}
      className={`min-h-[60px] border-2 border-dashed rounded-md mx-3 mb-2 transition-colors ${
        isOver 
          ? 'border-primary bg-primary/10' 
          : 'border-muted-foreground/20'
      }`}
    >
      {children}
    </div>
  );
}

function DraggableThread({
  thread,
  onDoubleClick,
  onDelete,
  currentThreadId,
  setCurrentThreadId,
  editingThreadId,
  editingTitle,
  setEditingTitle,
  handleSaveEdit,
  handleCancelEdit,
  handleKeyDown,
  inputRef,
}: DraggableThreadProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: thread._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <SidebarMenuItem key={thread._id} ref={setNodeRef} style={style}>
      <div className="flex items-center group hover:bg-accent rounded-md">
        <div
          className="cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        {editingThreadId === thread._id ? (
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
              currentThreadId === thread._id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setCurrentThreadId(thread._id)}
            onDoubleClick={() => onDoubleClick(thread._id, thread.title || "")}
          >
            {thread.title}
          </button>
        )}
        
        {editingThreadId !== thread._id && (
          <button
            className="opacity-0 group-hover:opacity-100 p-1 mr-2 hover:bg-destructive/10 rounded transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(thread._id);
            }}
            title="Delete thread"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </button>
        )}
      </div>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ setCurrentThreadId, currentThreadId }: props) {
  const deleteThread = useMutation(api.chat.deleteThread);
  const updateThread = useMutation(api.chat.updateThreadTitle);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const items = useQuery(api.chat.viewAllThreads);
  const createFolder = useMutation(api.folder.createFolder);
  const addUpdateFolder = useMutation(api.folder.addUpdateThreadToFolder);
  const removeFromFolder = useMutation(api.folder.removeThreadToFolder);
  const deleteFolder = useMutation(api.folder.deleteFolder);
  const folders = useQuery(api.folder.listFolders);
  const [unorganizedThreads, setUnorganizedThreads] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );


  // Initialize unorganized threads when items load
  useEffect(() => {
    if (items?.page) {
      const allThreadIds = items.page.map(thread => thread._id);
      const organizedThreadIds = folders?.flatMap(folder => folder.threadIds);
      const unorganized = allThreadIds.filter(id => !organizedThreadIds?.includes(id));
      setUnorganizedThreads(unorganized);
    }
  }, [items, folders]);

  const handleDeleteThread = async (threadId: string) => {
    await deleteThread({ threadId: threadId });

    setUnorganizedThreads(prev => prev.filter(id => id !== threadId));
    
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

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder({folderName: newFolderName.trim()})
      setNewFolderName("");
      setCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    await deleteFolder({ folderId: folderId });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if(overId === "unorganized"){
      removeFromFolder({threadId: activeId});
    }else{
      addUpdateFolder({threadId: activeId, folderId: overId});
    }

  };

  // Focus input when editing starts
  useEffect(() => {
    if (editingThreadId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingThreadId]);

  const getThreadById = (threadId: string) => {
    return items?.page.find(thread => thread._id === threadId);
  };

  const activeThread = activeId ? getThreadById(activeId) : null;

  return (
    <Sidebar>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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

                {/* Folder Management */}
                <div className="mt-4">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-medium text-muted-foreground">Folders</span>
                    <button
                      onClick={() => setCreatingFolder(true)}
                      className="p-1 hover:bg-accent rounded transition-colors"
                      title="Create new folder"
                    >
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  
                  {creatingFolder && (
                    <div className="px-3 py-2">
                      <div className="flex gap-2">
                        <Input
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="Folder name"
                          className="flex-1 h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateFolder();
                            if (e.key === "Escape") {
                              setCreatingFolder(false);
                              setNewFolderName("");
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleCreateFolder}
                          className="p-1 hover:bg-accent rounded transition-colors"
                        >
                          <Check className="h-3 w-3 text-green-600" />
                        </button>
                        <button
                          onClick={() => {
                            setCreatingFolder(false);
                            setNewFolderName("");
                          }}
                          className="p-1 hover:bg-accent rounded transition-colors"
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  <Accordion type="multiple" className="w-full">
                    {folders?.map((folder) => (
                      <AccordionItem key={folder._id} value={folder._id} className="relative">
                        <DroppableFolder
                          folderId={folder._id}
                          folderName={folder.name}
                          threadCount={folder?.threadIds?.length ?? 0}
                          onDelete={handleDeleteFolder}
                        />
                        <AccordionContent>
                          <div className="pl-6">
                            <SortableContext
                              items={folder?.threadIds ?? []}
                              strategy={verticalListSortingStrategy}
                            >
                              {folder?.threadIds?.map((threadId) => {
                                const thread = getThreadById(threadId);
                                if (!thread) return null;
                                
                                return (
                                  <DraggableThread
                                    key={thread._id}
                                    thread={thread}
                                    onDoubleClick={handleDoubleClick}
                                    onDelete={handleDeleteThread}
                                    currentThreadId={currentThreadId}
                                    setCurrentThreadId={setCurrentThreadId}
                                    editingThreadId={editingThreadId}
                                    editingTitle={editingTitle}
                                    setEditingTitle={setEditingTitle}
                                    handleSaveEdit={handleSaveEdit}
                                    handleCancelEdit={handleCancelEdit}
                                    handleKeyDown={handleKeyDown}
                                    inputRef={inputRef}
                                  />
                                );
                              })}
                            </SortableContext>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                {/* Unorganized Threads */}
                <div className="mt-4">
                  <div className="px-3 py-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Unorganized Chats ({unorganizedThreads.length})
                    </span>
                  </div>
                  
                  <DroppableUnorganized>
                    <SortableContext
                      items={unorganizedThreads}
                      strategy={verticalListSortingStrategy}
                    >
                      {unorganizedThreads.map((threadId) => {
                        const thread = getThreadById(threadId);
                        if (!thread) return null;
                        
                        return (
                          <DraggableThread
                            key={thread._id}
                            thread={thread}
                            onDoubleClick={handleDoubleClick}
                            onDelete={handleDeleteThread}
                            currentThreadId={currentThreadId}
                            setCurrentThreadId={setCurrentThreadId}
                            editingThreadId={editingThreadId}
                            editingTitle={editingTitle}
                            setEditingTitle={setEditingTitle}
                            handleSaveEdit={handleSaveEdit}
                            handleCancelEdit={handleCancelEdit}
                            handleKeyDown={handleKeyDown}
                            inputRef={inputRef}
                          />
                        );
                      })}
                    </SortableContext>
                  </DroppableUnorganized>
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <DragOverlay>
          {activeThread && (
            <div className="bg-background border rounded-md p-2 shadow-lg">
              <span className="text-sm font-medium">{activeThread.title}</span>
            </div>
          )}
        </DragOverlay>
        
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
      </DndContext>
    </Sidebar>
  );
}
