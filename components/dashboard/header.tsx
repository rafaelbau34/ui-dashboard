"use client";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Github } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 border-b bg-card sticky top-0 z-10 w-full shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-2" />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex -space-x-2">
          <Avatar className="size-7 border-2 border-card">
            <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=a" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Avatar className="size-7 border-2 border-card">
            <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=b" />
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
          <Avatar className="size-7 border-2 border-card">
            <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=c" />
            <AvatarFallback>C</AvatarFallback>
          </Avatar>
        </div>
        <ThemeToggle />
        <Button variant="ghost" size="icon" asChild className="size-8">
          <Link
            href="https://github.com/ln-dev7/square-ui/tree/master/templates/dashboard-5"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="size-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
