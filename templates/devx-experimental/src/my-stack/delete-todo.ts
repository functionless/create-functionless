import { Function } from "fl-exp";
import { $AWS } from "functionless";

import { AppTable } from "./table";

export default Function(async (event: { id: string }) => {
  await $AWS.DynamoDB.DeleteItem({
    Table: AppTable,
    Key: {
      pk: {
        S: "todo",
      },
      sk: {
        S: event.id,
      },
    },
  });

  return "DELETED";
});
