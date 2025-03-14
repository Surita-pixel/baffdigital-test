import Providers from "./providers";
import "./globals.css";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { setupDatabase } from "@/lib/dbsetup";

export const metadata = {
  title: "Baff Digital Dashboard",
  description: "Generated by create next app",
};

const Header = () => (
  <header className="bg-gradient-to-r from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-md py-4 border-b border-gray-200 dark:border-gray-700">
    <div className="container mx-auto flex items-center justify-between px-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Baff Digital
      </h1>
      <nav className="flex space-x-6">
        <NavLink href="/clients">Clients</NavLink>
        <NavLink href="/procedures">Procedures</NavLink>
        <NavLink href="/quotes">Quotes</NavLink>
      </nav>
    </div>
  </header>
);

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="relative text-gray-700 dark:text-gray-300 font-medium transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400"
  >
    {children}
    <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-500 scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
  </Link>
);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await setupDatabase();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen antialiased",
          "bg-gray-50 text-gray-900",
          "dark:bg-gray-900 dark:text-gray-100"
        )}
      >
        <Providers>
          <Header />
          <main className="container mx-auto px-6 py-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
