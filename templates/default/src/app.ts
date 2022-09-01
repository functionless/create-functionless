import { App, Stack } from "aws-cdk-lib";
import { Function, StepFunction } from "functionless";

const app = new App();

const stack = new Stack(app, "MyStack");

const sayFunction = new Function(
  stack,
  "SayFunction",
  async (event: { message: string }) => {
    console.log(event.message);
  }
);

new StepFunction(stack, "Workflow", async (event: { name: string }) => {
  sayFunction({ message: `Hello ${event.name}` });
});
