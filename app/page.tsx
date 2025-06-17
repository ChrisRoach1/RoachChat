"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Image as ImageIcon, Sparkles, Zap, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-15 h-15 rounded-lg flex items-center justify-center p-2">
              <Image src={"image.svg"} alt="My SVG" width={250} height={250} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Roach Chat</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-secondary-foreground">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="mb-8">
            <div className="rounded-2xl flex items-center justify-center mx-auto mb-6 p-4">
            <Image src={"image.svg"} alt="My SVG" width={250} height={250} />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Meet Your
            <span className="text-primary"> AI Companion</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Start conversations with our intelligent little artificial roach or create stunning images with advanced AI models. 
            Choose from multiple AI models and unlock the power of artificial intelligence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/chat">
              <Button size="lg" className="px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Chatting
              </Button>
            </Link>
            
            <Link href="/image-gen">
              <Button variant="outline" size="lg" className="px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <ImageIcon className="w-5 h-5 mr-2" />
                Generate Images
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Chat Feature */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 p-2">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl text-card-foreground">AI Chat Assistant</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Engage in natural conversations with our advanced AI models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground mb-6">
                <li className="flex items-center">
                  <Zap className="w-4 h-4 text-primary mr-3" />
                  Multiple AI model support
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 text-primary mr-3" />
                  Organized conversation threads
                </li>
              </ul>
              <Link href="/chat">
                <Button className="w-full rounded-lg">
                  Start New Chat
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Image Generation Feature */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-chart-2 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <ImageIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl text-card-foreground">AI Image Generation</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Create stunning visuals from your imagination using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground mb-6">
                <li className="flex items-center">
                  <Sparkles className="w-4 h-4 text-chart-2 mr-3" />
                  DALL-E 3 integration
                </li>
                <li className="flex items-center">
                  <ImageIcon className="w-4 h-4 text-chart-2 mr-3" />
                  Detailed prompt support
                </li>
              </ul>
              <Link href="/image-gen">
                <Button variant="outline" className="w-full rounded-lg">
                  Generate Images
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-muted rounded-2xl p-12 border">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already experiencing the future of AI-powered conversations and creativity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Your First Chat
              </Button>
            </Link>
            <Link href="/image-gen">
              <Button variant="outline" size="lg" className="px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                <ImageIcon className="w-5 h-5 mr-2" />
                Create Your First Image
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border mt-16">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2025 Roach Chat. Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}
