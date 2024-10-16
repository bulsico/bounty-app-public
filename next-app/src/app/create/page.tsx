import Loading from "@/components/Loading";
import dynamic from "next/dynamic";

const CreateBounty = dynamic(
  () => import("@/components/CreateBounty").then((mod) => mod.CreateBounty),
  {
    ssr: false,
    loading: () => <Loading text="create bounty form" />,
  }
);

export default function CreateBountyPage() {
  return <CreateBounty />;
}
