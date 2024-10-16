import Loading from "@/components/Loading";
import dynamic from "next/dynamic";
const UserStat = dynamic(
  () => import("@/components/UserStat").then((mod) => mod.UserStat),
  {
    ssr: false,
    loading: () => <Loading text="user stat" />,
  }
);
const UserBountyBoard = dynamic(
  () =>
    import("@/components/UserBountyBoard").then((mod) => mod.UserBountyBoard),
  {
    ssr: false,
    loading: () => <Loading text="user create bounties" />,
  }
);
const UserBuildBoard = dynamic(
  () => import("@/components/UserBuildBoard").then((mod) => mod.UserBuildBoard),
  {
    ssr: false,
    loading: () => <Loading text="user created builds" />,
  }
);

export default function ProfilePage({
  params,
}: {
  params: { userAddr: `0x${string}` };
}) {
  const { userAddr } = params;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <UserStat userAddr={userAddr} />
      <UserBountyBoard userAddr={userAddr} />
      <UserBuildBoard userAddr={userAddr} />
    </div>
  );
}
