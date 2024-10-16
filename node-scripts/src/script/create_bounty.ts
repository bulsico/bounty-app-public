import { getSurfClient, getAccount } from "../lib/utils";

const run = async () => {
  getSurfClient()
    .entry.entry_create_bounty({
      typeArguments: [],
      functionArguments: ["title", "link", undefined, "0xa", 100, 1, 3600, 1],
      account: getAccount(),
    })
    .then(console.log);
};

run();
