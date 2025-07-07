"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Image as ImageIcon, Sparkles, Zap, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    // Trigger animations after component mounts
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-blue-500/5 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-purple-500/5 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <div className={`flex items-center justify-between transition-all duration-1000 ease-out ${
          isLoaded ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
        }`}>
          <div className="flex items-center space-x-3 group">
            <div className="w-15 h-15 rounded-lg flex items-center justify-center p-2 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6">
              <Image src={"image.svg"} alt="My SVG" width={250} height={250} className="transition-all duration-300" />
            </div>
            <h1 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
              Roach Chat
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-secondary-foreground hover:scale-105 transition-transform duration-200 cursor-default">
              <Sparkles className="w-3 h-3 mr-1 animate-spin" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="mb-8">
            <div className={`rounded-2xl flex items-center justify-center mx-auto mb-6 p-4 transition-all duration-1000 ease-out delay-300 ${
              isLoaded ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-95"
            }`}>
              <div className="relative group">
                <Image 
                  src={"image.svg"} 
                  alt="My SVG" 
                  width={250} 
                  height={250}
                  className="transition-all duration-700 hover:scale-110 hover:rotate-12 animate-float"
                />
                {/* Floating particles */}
                <div className="absolute -top-2 -right-2 w-3 h-3 bg-primary rounded-full animate-bounce delay-1000 opacity-70"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-1500 opacity-70"></div>
                <div className="absolute top-1/2 -right-4 w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-2000 opacity-70"></div>
              </div>
            </div>
          </div>
          
          <h1 className={`text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight transition-all duration-1000 ease-out delay-500 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}>
            Meet Your
            <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text animate-gradient-x"> AI Companion</span>
          </h1>
          
          <p className={`text-xl text-muted-foreground mb-8 leading-relaxed transition-all duration-1000 ease-out delay-700 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}>
            Start conversations with our intelligent little artificial roach or create stunning images with advanced AI models. 
            Choose from multiple AI models and unlock the power of artificial intelligence.
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-1000 ease-out delay-1000 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}>
            <Link href="/chat">
              <Button 
                size="lg" 
                className="group px-8 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transform hover:scale-105 hover:-translate-y-1"
              >
                <MessageCircle className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Start Chatting
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            
            <Link href="/image-gen">
              <Button 
                variant="outline" 
                size="lg" 
                className="group px-8 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-2 hover:border-primary/50 hover:bg-primary/5"
              >
                <ImageIcon className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Generate Images
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Chat Feature */}
          <Card 
            className={`group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-br from-background to-background/80 backdrop-blur-sm hover:scale-105 hover:-translate-y-2 cursor-pointer ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
            style={{ transitionDelay: "1200ms" }}
            onMouseEnter={() => setHoveredCard("chat")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="pb-4 relative z-10">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 p-2 shadow-lg group-hover:shadow-xl">
                <MessageCircle className="w-6 h-6 text-primary-foreground group-hover:animate-pulse" />
              </div>
              <CardTitle className="text-2xl text-card-foreground group-hover:text-primary transition-colors duration-300">
                AI Chat Assistant
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Engage in natural conversations with our advanced AI models
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <ul className="space-y-3 text-muted-foreground mb-6">
                <li className={`flex items-center transition-all duration-300 ${hoveredCard === "chat" ? "translate-x-2" : ""}`}>
                  <Zap className="w-4 h-4 text-primary mr-3 group-hover:animate-pulse" />
                  Multiple AI model support
                </li>
                <li className={`flex items-center transition-all duration-300 delay-100 ${hoveredCard === "chat" ? "translate-x-2" : ""}`}>
                  <Users className="w-4 h-4 text-primary mr-3 group-hover:animate-pulse" />
                  Organized conversation threads
                </li>
              </ul>
              <Link href="/chat">
                <Button className="w-full rounded-lg group-hover:bg-primary/90 transition-all duration-300 group-hover:shadow-lg transform group-hover:scale-105">
                  Start New Chat
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Image Generation Feature */}
          <Card 
            className={`group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-gradient-to-br from-background to-background/80 backdrop-blur-sm hover:scale-105 hover:-translate-y-2 cursor-pointer ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
            }`}
            style={{ transitionDelay: "1400ms" }}
            onMouseEnter={() => setHoveredCard("image")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-chart-2/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardHeader className="pb-4 relative z-10">
              <div className="w-12 h-12 bg-chart-2 rounded-xl flex items-center justify-center mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <ImageIcon className="w-6 h-6 text-primary-foreground group-hover:animate-pulse" />
              </div>
              <CardTitle className="text-2xl text-card-foreground group-hover:text-chart-2 transition-colors duration-300">
                AI Image Generation
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Create stunning visuals from your imagination using AI
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <ul className="space-y-3 text-muted-foreground mb-6">
                <li className={`flex items-center transition-all duration-300 ${hoveredCard === "image" ? "translate-x-2" : ""}`}>
                  <Sparkles className="w-4 h-4 text-chart-2 mr-3 group-hover:animate-spin" />
                  DALL-E 3 integration
                </li>
                <li className={`flex items-center transition-all duration-300 delay-100 ${hoveredCard === "image" ? "translate-x-2" : ""}`}>
                  <ImageIcon className="w-4 h-4 text-chart-2 mr-3 group-hover:animate-pulse" />
                  Detailed prompt support
                </li>
              </ul>
              <Link href="/image-gen">
                <Button variant="outline" className="w-full rounded-lg group-hover:bg-chart-2/10 group-hover:border-chart-2 transition-all duration-300 group-hover:shadow-lg transform group-hover:scale-105">
                  Generate Images
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className={`text-center bg-muted/50 backdrop-blur-sm rounded-2xl p-12 border border-border/50 hover:border-primary/20 transition-all duration-500 hover:shadow-xl ${
          isLoaded ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`} style={{ transitionDelay: "1600ms" }}>
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join tens of users who are already experiencing the future of AI-powered conversations and creativity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="group px-8 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 transform hover:scale-105 hover:-translate-y-1">
                <MessageCircle className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Start Your First Chat
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/image-gen">
              <Button variant="outline" size="lg" className="group px-8 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border-2 hover:border-primary/50 hover:bg-primary/5">
                <ImageIcon className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Create Your First Image
                <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`container mx-auto px-4 py-8 border-t border-border mt-16 transition-all duration-1000 ease-out delay-1800 ${
        isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}>
        <div className="text-center text-muted-foreground">
          <p>&copy; 2025 Roach Chat. Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}
