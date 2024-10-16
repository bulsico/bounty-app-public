import Loading from "@/components/Loading";
import dynamic from "next/dynamic";

const Build = dynamic(
  () => import("@/components/Build").then((mod) => mod.Build),
  {
    ssr: false,
    loading: () => <Loading text="build" />,
  }
);

export default function BuildPage({
  params,
}: {
  params: { buildObjAddr: `0x${string}` };
}) {
  const { buildObjAddr } = params;

  return <Build buildObjAddr={buildObjAddr} />;
}
