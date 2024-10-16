import type { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Create New Bounty",
  description: "Create new bounty",
};

const CreateBountyLayout = ({ children }: PropsWithChildren) => {
  return <div>{children}</div>;
};

export default CreateBountyLayout;
