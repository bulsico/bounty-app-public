import type { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: "Profile Detail",
  description: "Profile Detail",
};

const ProfileLayout = ({ children }: PropsWithChildren) => {
  return <div>{children}</div>;
};

export default ProfileLayout;
