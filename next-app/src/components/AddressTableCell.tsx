import { useQuery } from "@tanstack/react-query";

import { getAnsNameOrTruncatedAddr } from "@/lib/clientOnlyUtils";

type AddrCellProps = {
  addr: string;
};

export const AddressTableCell = ({ addr }: AddrCellProps) => {
  const fetchData = async () => {
    return await getAnsNameOrTruncatedAddr(addr);
  };
  const { data: ansNameOrTruncatedAddr } = useQuery({
    queryKey: [`${addr}-ans`],
    queryFn: fetchData,
  });
  return (
    <div className="w-[100px]">
      <a href={`/profile/${addr}`} className="text-blue-600 dark:text-blue-300">
        {ansNameOrTruncatedAddr}
      </a>
    </div>
  );
};
