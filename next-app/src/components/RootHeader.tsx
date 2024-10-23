import { Wallet } from "@/components/Wallet";
import { RootSidebarMobile } from "./RootSidebarMobile";

export const RootHeader = () => {
  return (
    <div className="flex justify-between items-center gap-6 w-full">
      <RootSidebarMobile />
      <div className="flex flex-col gap-2 md:gap-3">
        <h1 className="text-xl font-semibold tracking-tight">
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
