import type { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Bounty Detail",
  description: "Bounty Detail",
};

const BountyLayout = ({ children }: PropsWithChildren) => {
  return <div>{children}</div>;
};

export default BountyLayout;
