import { getPostgresClient } from "../lib/utils";

const run = async () => {
  const client = await getPostgresClient();
  client.query(
    "SELECT * FROM bounties ORDER BY create_timestamp DESC LIMIT 1",
    (err, res) => {
      if (err) {
        console.error(err.stack);
      } else {
        console.log(res.rows[0]);
      }
      client.end();
    }
  );
};

run();
