import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";

export const metadata: Metadata = {
  title: "Multi-tenant Platform",
  description: "Secure and scalable assistant platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#050505] text-white">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
