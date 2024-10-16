"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { IndexerStatus } from "@/components/IndexerStatus";
import { ThemeToggle } from "./ThemeToggle";
import { User, Plus, Github, BarChart } from "lucide-react";
import { TotalBountyValue } from "@/components/TotalBountyValue";

export const RootSidebar = () => {
  const { account, connected } = useWallet();

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-6 px-2 py-2">
        <div className="">
          <TotalBountyValue />
        </div>
        <div className="space-y-4">
          <SidebarItem href="/create" icon={Plus} text="Create" />
          <SidebarItem
            href={`/profile/${account?.address}`}
            icon={User}
            text="Profile"
            linkDisabled={!connected}
          />
          <SidebarItem href="/analytics" icon={BarChart} text="Analytics" />
        </div>
      </div>
      <div className="mt-auto p-4 space-y-4">
        <ThemeToggle />
        <SidebarItem
          href="https://github.com/bulsico/bounty-app-public"
          icon={Github}
          text="Source code"
          external
        />
        <IndexerStatus />
      </div>
    </div>
  );
};

type SidebarItemProps = {
  href: string;
  icon: React.ComponentType<any>;
  text: string;
  linkDisabled?: boolean;
  external?: boolean;
};

const SidebarItem = ({
  href,
  icon: Icon,
  text,
  linkDisabled = false,
  external = false,
}: SidebarItemProps) =>
  linkDisabled ? (
    <div className="flex items-center py-2 px-4 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
      <Icon className="h-4 w-4 mr-2" />
      {text}
    </div>
  ) : (
    <a
      href={linkDisabled ? "#" : href}
      className="flex items-center py-2 px-4 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      <Icon className="h-4 w-4 mr-2" />
      {text}
    </a>
  );
