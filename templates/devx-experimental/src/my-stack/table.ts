import { AttributeType, BillingMode } from "aws-cdk-lib/aws-dynamodb";
import { Table } from "fl-exp";

interface TableItem<T extends string> {
  pk: T;
  sk: string;
  type: T;
  id: string;
}

interface Todo extends TableItem<"todo"> {
  message: string;
}

export const AppTable = Table<Todo, "pk", "sk">({
  partitionKey: {
    name: "pk",
    type: AttributeType.STRING,
  },
  sortKey: {
    name: "sk",
    type: AttributeType.STRING,
  },
  billingMode: BillingMode.PAY_PER_REQUEST,
});

export default AppTable;
