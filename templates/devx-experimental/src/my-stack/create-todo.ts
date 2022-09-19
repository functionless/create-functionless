import { Function } from "fl-exp";
import { $AWS } from "functionless";
import * as uuid from "uuid";

import { AppTable } from "./table";

export default Function(async (event: { message: string }) => {
  const id = uuid.v4();
  await $AWS.DynamoDB.PutItem({
    Table: AppTable,
    Item: {
      pk: {
        S: "todo",
      },
      sk: {
        S: id,
      },
      id: {
        S: id,
      },
      message: {
        S: event.message,
      },
      type: {
        S: "todo",
      },
    },
  });

  return "CREATED";
});
