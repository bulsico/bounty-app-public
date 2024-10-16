import Loading from "@/components/Loading";
import dynamic from "next/dynamic";

const Bounty = dynamic(
  () => import("@/components/Bounty").then((mod) => mod.Bounty),
  {
    ssr: false,
    loading: () => <Loading text="bounty" />,
  }
);
const BuildBoard = dynamic(
  () => import("@/components/BuildBoard").then((mod) => mod.BuildBoard),
  {
    ssr: false,
    loading: () => <Loading text="build board" />,
  }
);

export default function BountyPage({
  params,
}: {
  params: { bountyObjAddr: `0x${string}` };
}) {
  const { bountyObjAddr } = params;

  return (
    <div className="flex flex-col gap-6">
      <Bounty bountyObjAddr={bountyObjAddr} />
      <BuildBoard bountyObjAddr={bountyObjAddr} />
    </div>
  );
}
