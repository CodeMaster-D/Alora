"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Heart,
  BookOpen,
  Wind,
  BarChart3,
  Settings,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useAccessibilityStore } from "../../store/useAccessbilityStore";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Mood", href: "/mood", icon: Heart },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Breathe", href: "/breathe", icon: Wind },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { fontSize } = useAccessibilityStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small":
        return "text-sm";
      case "large":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-card border-r transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <h2 className={cn("text-xl font-bold", getFontSizeClass())}>Alora</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            
            return (
              <Button
                key={item.name}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed ? "px-2" : "px-3",
                  getFontSizeClass()
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-2 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isCollapsed ? "px-2" : "px-3",
                getFontSizeClass()
              )}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <span className="ml-3 truncate">{user?.displayName}</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}