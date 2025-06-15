"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ImageIcon,
  Wand2,
  Download,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
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
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

const availableModels = [
  { modelName: "dall-e-3", modelDescription: "DALL-E 3" },
  { modelName: "dall-e-2", modelDescription: "DALL-E 2" },
  //{ modelName: "gpt-image-1", modelDescription: "GPT Image 1" },
];

export default function ImageGenPage() {
  const messageFormSchema = z.object({
    message: z.string().min(1),
  });

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      message: "",
    },
  });

  const [selectedModel, setSelectedModel] = useState<string>("dall-e-3");
  const router = useRouter();
  const userImages = useQuery(api.image.listUserGeneratedImageRecord);
  const createUserImageRecord = useMutation(
    api.image.createUserGeneratedImageRecord,
  );
  const generateImage = useAction(api.image.generateImageAction);

  const handleGenerateImage = async (
    values: z.infer<typeof messageFormSchema>,
  ) => {
    if (!values.message.trim() || !selectedModel) return;

    try {
      const tempPromptValue = values.message;
      form.reset();
      const recordId = await createUserImageRecord({ prompt: tempPromptValue });
      await generateImage({
        modelName: selectedModel,
        prompt: tempPromptValue,
        userGeneratedImageId: recordId,
      });

    } catch (error) {
      console.error("Failed to generate image:", error);
    }
  };

  const downloadImage = async (imageUrl: string | undefined) => {
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

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `image-${timestamp}.png`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  return (
    <>
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/chat")}
          className="flex items-center gap-2 hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Chat</span>
        </Button>
      </div>

      <div className="flex-1 flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/10">
        {/* Header with Prompt Area */}
        <div className="border-b bg-background/95 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-3 backdrop-blur-sm border border-primary/10">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  AI Image Generation
                </h1>
              </div>
              <p className="text-muted-foreground">
                Create stunning images with AI. Describe what you want to see
                and let our models bring it to life.
              </p>
            </div>

            {/* Generation Form */}
            <Card className="bg-background/50 backdrop-blur-sm border-2 border-border hover:border-primary/20 transition-all duration-200">
              <CardContent className="p-6">
                <Form {...form}>
                  <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(handleGenerateImage)}
                  >
                    {/* Model Selection */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                          <Sparkles className="h-4 w-4" />
                          <span>AI Model</span>
                        </label>
                        <Select
                          value={selectedModel}
                          onValueChange={setSelectedModel}
                        >
                          <SelectTrigger className="h-11 bg-background/80 border-border hover:border-primary/50 transition-all duration-200">
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent className="bg-background/95 backdrop-blur-sm">
                            {availableModels.map((model) => (
                              <SelectItem
                                key={model.modelName}
                                value={model.modelName}
                                className="cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                  <span className="font-medium">
                                    {model.modelDescription}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Prompt Input */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <ImageIcon className="h-4 w-4" />
                        <span>Image Prompt</span>
                      </label>

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Describe the image you want to generate... Be as detailed as possible for best results."
                                className="min-h-[100px] bg-background/80 border-border hover:border-primary/50 transition-all duration-200 focus:ring-2 focus:ring-primary/20 resize-none"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end items-center mt-2">
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <span className="flex items-center gap-2">
                            <Wand2 className="h-4 w-4" />
                            Generate Image
                          </span>
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Generated Images Gallery */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Generated Images</h2>
              <Badge variant="secondary" className="bg-muted/50">
                {userImages?.length} images
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userImages?.map((image) => (
                <Card
                  key={image._id}
                  className="group hover:shadow-lg transition-all duration-200 bg-background/50 backdrop-blur-sm border-border hover:border-primary/20"
                >
                  <CardHeader className="p-3">
                    <div className="aspect-square relative overflow-hidden rounded-lg bg-muted/20">
                      {image.status === "pending" ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Generating...
                            </p>
                          </div>
                        </div>
                      ) : image.imageUrl ? (
                        <Image
                          src={image.imageUrl}
                          alt={image.prompt}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}

                      {/* Overlay Actions */}
                      {image.status === "completed" && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => downloadImage(image.imageUrl)}
                            className="bg-background/90 hover:bg-background"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-3 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {image.prompt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {userImages?.length === 0 && (
              <div className="text-center py-12">
                <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-8 mb-6 backdrop-blur-sm border border-primary/10 w-fit mx-auto">
                  <ImageIcon className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No images generated yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first AI-generated image using the prompt above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
