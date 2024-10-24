import { Wallet } from "@/components/Wallet";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const RootHeader = () => {
  return (
    <div className="flex justify-between items-center gap-6 w-full">
      <SidebarTrigger />
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight sm:hidden">
          <a href="/">Aptos Bounties</a>
        </h1>
      </div>
      <div className="flex space-x-2 items-center justify-center">
        <div className="flex-grow text-right min-w-0">
          <Wallet />
        </div>
      </div>
    </div>
  );
};
