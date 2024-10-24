"use client";

import { User, Home, BarChart, Plus, Github } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { TotalBountyValue } from "./TotalBountyValue";
import { ThemeToggle } from "./ThemeToggle";
import { IndexerStatus } from "./IndexerStatus";

const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Create",
    url: "/create",
    icon: Plus,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart,
  },
  {
    title: "Source code",
    url: "https://github.com/bulsico/bounty-app-public",
    icon: Github,
  },
];

export function AppSidebar() {
  const { account, connected } = useWallet();
  if (connected && navigationItems.length === 4) {
    navigationItems.push({
      title: "Profile",
      url: `/profile/${account?.address}`,
      icon: User,
    });
  }

  return (
    <Sidebar>
      <SidebarContent className="justify-between">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className="px-3 py-4">
                <a href="/" className="flex items-center space-x-2">
                  <h1 className="text-xl font-semibold bg-clip-text ">
                    Aptos Bounties
                  </h1>
                </a>
              </div>
              <TotalBountyValue />
              <div className="mt-2">
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        target={
                          item?.url?.startsWith("http") ? "_blank" : "_self"
                        }
                        rel={
                          item?.url?.startsWith("http")
                            ? "noopener noreferrer"
                            : ""
                        }
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <ThemeToggle />
              <IndexerStatus />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
