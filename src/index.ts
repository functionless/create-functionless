#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import spawn from "cross-spawn";
import fs from "fs";
import mustache from "mustache";
import path from "path";
import prompts from "prompts";
import validateProjectName from "validate-npm-package-name";
import packageJson from "../package.json";

const packageManager = process.env.npm_config_user_agent;

if (!packageManager?.startsWith("yarn")) {
  console.error(chalk.red("Only yarn is supported currently."));
  console.log(`Have you installed yarn? ${chalk.yellow("npm i -g yarn")}`);
  console.log(`If so, run ${chalk.yellow("yarn create functionless")}`);
  process.exit(1);
}

const program = new Command();

program.name(packageJson.name).version(packageJson.version).parse(process.argv);

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function askProjectName() {
  const defaultName = "new-project";

  const answer = await prompts({
    type: "text",
    name: "projectName",
    message: "Project name:",
    initial: defaultName,
    validate: (name) => {
      const result = validateProjectName(name);
      if (result.validForNewPackages) {
        return true;
      }
      return `Invalid project name: ${name}`;
    },
  });

  if (typeof answer.projectName === "string") {
    return answer.projectName.trim();
  }

  return defaultName;
}

function failOnError(response: ReturnType<typeof spawn.sync>, message: string) {
  if (response.status !== 0) {
    console.error(chalk.red(message));
    process.exit(1);
  }
}

async function run() {
  const templateName = "default";
  const templateRoot = path.join(__dirname, "..", "templates", templateName);
  const templateManifestPath = path.join(templateRoot, "manifest.json");
  const templateManifest: string[] = JSON.parse(
    await fs.promises.readFile(templateManifestPath, "utf-8")
  );

  const projectName = await askProjectName();

  console.log();
  console.log(`Creating ${chalk.green(projectName)}...`);

  const root = path.resolve(projectName);

  try {
    await fs.promises.mkdir(root);
  } catch (err: any) {
    if (err.code === "EEXIST") {
      console.error(`${chalk.red(`Folder already exists: ${projectName}`)}`);
    }
    process.exit(1);
  }

  const renderTemplate = async (
    localPath: string,
    data: Record<string, unknown>
  ) => {
    const templateFilePath = path.join(templateRoot, localPath);
    const templateContent = mustache.render(
      await fs.promises.readFile(templateFilePath, "utf-8"),
      data
    );
    // Npm won't include `.gitignore` files in a package.
    // This allows you to add .template as a file ending
    // and it will be removed when rendered in the end
    // project.
    const destinationPath = path.join(root, localPath.replace(".template", ""));
    await fs.promises.mkdir(path.dirname(destinationPath), {
      recursive: true,
    });
    await fs.promises.writeFile(destinationPath, templateContent);
  };

  const templateData = {
    projectName,
  };

  await Promise.all(
    templateManifest.map((path) => renderTemplate(path, templateData))
  );

  process.chdir(root);

  console.log();
  console.log("Installing packages...");
  console.log();

  const dependencies = [
    "@aws-cdk/aws-appsync-alpha",
    "@functionless/ast-reflection",
    "@functionless/language-service",
    "aws-cdk",
    "aws-cdk-lib",
    "aws-sdk",
    "constructs",
    "esbuild",
    "functionless",
    "typesafe-dynamodb",
    "typescript",
  ];

  failOnError(
    spawn.sync("yarn", ["add", "-D", ...dependencies], {
      stdio: "inherit",
    }),
    "Unable to install dependencies"
  );

  console.log();
  console.log("Initializing git repository...");
  console.log();

  const gitErrorMessage = "Error initializing git repository.";

  failOnError(
    spawn.sync("git", ["init", "-q"], {
      stdio: "inherit",
    }),
    gitErrorMessage
  );

  failOnError(
    spawn.sync("git", ["add", "."], {
      stdio: "inherit",
    }),
    gitErrorMessage
  );

  failOnError(
    spawn.sync("git", ["commit", "-q", "-m", "initial commit"], {
      stdio: "inherit",
    }),
    gitErrorMessage
  );

  console.log(chalk.green("Project ready!"));
  console.log();
  console.log(`Run ${chalk.yellow(`cd ./${projectName}`)} to get started.`);

  process.exit(0);
}
