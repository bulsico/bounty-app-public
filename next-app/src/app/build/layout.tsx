import type { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Build Detail",
  description: "Build Detail",
};

const BuildLayout = ({ children }: PropsWithChildren) => {
  return <div>{children}</div>;
};

export default BuildLayout;
