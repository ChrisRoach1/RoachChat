import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
// import { ReactScan } from "@/components/react-scan";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roach Chat",
  description: "A multi-model AI chat app",
  icons: {
    icon: "/image.svg",
  },
};

export const dynamic = 'force-dynamic'


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider dynamic>
          <ConvexClientProvider>
          {/* <ReactScan /> */}
            {children}
            <Toaster
                    toastOptions={{
                        unstyled: false,
                        classNames:{
                            error: '!bg-destructive !text-white',
                            success: '!bg-primary !text-primary-foreground'
                        }
                     }} />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
