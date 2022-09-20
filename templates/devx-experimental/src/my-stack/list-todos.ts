import { Function } from "fl-exp";
import { $AWS } from "functionless";

import { AppTable } from "./table";

export default Function(async (event: {}) => {
  const response = await $AWS.DynamoDB.Query({
    Table: AppTable,
    KeyConditionExpression: "#pk = :pk",
    ExpressionAttributeNames: {
      "#pk": "pk",
    },
    ExpressionAttributeValues: {
      ":pk": {
        S: "todo",
      },
    },
  });

  return (response.Items ?? []).map((item) => {
    return {
      id: item.id.S,
      message: item.message.S,
    };
  });
});