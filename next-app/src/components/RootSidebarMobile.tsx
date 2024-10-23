"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { User, Plus, BarChart, Github, Menu } from "lucide-react";

import { IndexerStatus } from "@/components/IndexerStatus";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TotalBountyValue } from "./TotalBountyValue";

export const RootSidebarMobile = () => {
  const { account, connected } = useWallet();
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-primary">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
          <div className="flex flex-col justify-between h-full">
            <div className="space-y-6 px-3 py-2">
              <div className="">
                <TotalBountyValue />
              </div>
              <div className="space-y-4">
                <MobileMenuItem
                  href="/create"
                  icon={Plus}
                  text="Create"
                  setOpen={setOpen}
                />
                <MobileMenuItem
                  href="/analytics"
                  icon={BarChart}
                  text="Analytics"
                  setOpen={setOpen}
                />
                {connected && (
                  <MobileMenuItem
                    href={`/profile/${account?.address}`}
                    icon={User}
                    text="Profile"
                    setOpen={setOpen}
                  />
                )}
              </div>
            </div>
            <div className="mt-auto p-4 space-y-4">
              <ThemeToggle />
              <MobileMenuItem
                href="https://github.com/bulsico/bounty-app-public"
                icon={Github}
                text="Source code"
                external
                setOpen={setOpen}
              />
              <IndexerStatus />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

type MobileMenuItemProps = {
  href: string;
  icon: React.ComponentType<any>;
  text: string;
  linkDisabled?: boolean;
  external?: boolean;
  setOpen: (open: boolean) => void;
};

const MobileMenuItem = ({
  href,
  icon: Icon,
  text,
  linkDisabled = false,
  external = false,
  setOpen,
}: MobileMenuItemProps) =>
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
      onClick={() => setOpen(false)}
    >
      <Icon className="h-4 w-4 mr-2" />
      {text}
    </a>
  );
