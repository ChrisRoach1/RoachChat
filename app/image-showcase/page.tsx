"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ImageIcon,
  Download,
  Search,
  ArrowLeft,
  Sparkles,
  Share2,
  Calendar,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function ImageShowcasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const router = useRouter();
  
  const publicImages = useQuery(api.image.listPublicImages);

  // Filter and sort images based on search and sort preferences
  const filteredAndSortedImages = useMemo(() => {
    if (!publicImages) return [];

    let filtered = publicImages.filter((image) =>
      image.prompt.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === "newest") {
      filtered = filtered.sort((a, b) => b._creationTime - a._creationTime);
    } else {
      filtered = filtered.sort((a, b) => a._creationTime - b._creationTime);
    }

    return filtered;
  }, [publicImages, searchQuery, sortBy]);

  const downloadImage = async (imageUrl: string | undefined, prompt: string) => {
    if (!imageUrl) return;

    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Failed to fetch image");

      // Convert to blob
      const blob = await response.blob();

      // Create download URL
      const downloadUrl = window.URL.createObjectURL(blob);

      // Create temporary download link
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Generate filename from prompt (first 30 chars) + timestamp
      const safePrompt = prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `${safePrompt}-${timestamp}.png`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success("Image downloaded successfully!");
    } catch {
      toast.error("Failed to download image. Please try again.");
    }
  };

  const shareImage = async (imageUrl: string | undefined, prompt: string) => {
    if (!imageUrl) return;

    if (navigator.share) {
      await navigator.share({
        title: 'AI Generated Image',
        text: prompt,
        url: imageUrl,
      });
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(imageUrl);
      toast.success("Image URL copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/chat")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Chat</span>
        </Button>
      </div>

      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Sparkles className="h-8 w-8 text-primary" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full animate-pulse"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                AI Image Gallery
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing AI-generated images created by our community. 
              Get inspired and download your favorites.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images by prompt..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/80 border-border hover:border-primary/50 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort By */}
              <Select value={sortBy} onValueChange={(value: "newest" | "oldest") => setSortBy(value)}>
                <SelectTrigger className="w-32 bg-background/80 border-border hover:border-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-sm">
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Newest
                    </div>
                  </SelectItem>
                  <SelectItem value="oldest">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Oldest
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-6" />

            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-border/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {filteredAndSortedImages.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {searchQuery ? "Results" : "Public Images"}
              </div>
            </div>
            {searchQuery && (
              <>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    Searching for: <Badge variant="secondary">{searchQuery}</Badge>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Images Gallery */}
      <div className="max-w-7xl mx-auto p-6">
        {filteredAndSortedImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAndSortedImages.map((image) => (
              <Card
                key={image._id}
                className="group hover:shadow-xl transition-all duration-300 bg-background/50 backdrop-blur-sm border-border hover:border-primary/30 hover:-translate-y-1"
              >
                <CardHeader className="p-3">
                  <div className="aspect-square relative overflow-hidden rounded-lg bg-gradient-to-br from-muted/30 to-muted/10">
                    {image.imageUrl ? (
                      <Image
                        src={image.imageUrl}
                        alt={image.prompt}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadImage(image.imageUrl, image.prompt)}
                        className="bg-background/90 hover:bg-background shadow-lg"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => shareImage(image.imageUrl, image.prompt)}
                        className="bg-background/90 hover:bg-background shadow-lg"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-3 pt-0">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {image.prompt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div>
                      {new Date(image._creationTime).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="relative mb-6">
                <ImageIcon className="h-20 w-20 text-muted-foreground/30 mx-auto" />
              </div>
              
              {searchQuery ? (
                <>
                  <h3 className="text-xl font-semibold mb-2">No images found</h3>
                                     <p className="text-muted-foreground mb-4">
                     No images match your search for &ldquo;{searchQuery}&rdquo;. Try a different search term.
                   </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery("")}
                    className="hover:bg-primary hover:text-primary-foreground"
                  >
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-2">No public images yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share your AI-generated masterpieces with the community!
                  </p>
                  <Button 
                    onClick={() => router.push("/image-gen")}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                  >
                    Create Images
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
