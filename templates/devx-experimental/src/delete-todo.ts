import { LambdaFunction } from "fl-exp";
import { AppTable } from "./table";

export default LambdaFunction(async (event: { id: string }) => {
  await AppTable.delete({
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
