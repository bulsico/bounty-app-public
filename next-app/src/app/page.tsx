import Loading from "@/components/Loading";
import dynamic from "next/dynamic";

const BountyBoard = dynamic(
  () => import("@/components/BountyBoard").then((mod) => mod.BountyBoard),
  {
    ssr: false,
    loading: () => <Loading text="bounty board" />,
  }
);

export default function HomePage() {
  return <BountyBoard />;
}
