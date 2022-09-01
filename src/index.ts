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

const program = new Command();

program.name(packageJson.name).version(packageJson.version).parse(process.argv);

async function askProjectName() {
  const defaultName = "new-project";

  const answer = await prompts({
    type: "text",
    name: "projectName",
    message: "Project name:",
    initial: defaultName,
    validate: (name) => {
      const result = validateProjectName(name);
      if (result.validForNewPackages) return true;
      return `Invalid project name: ${name}`;
    },
  });

  if (typeof answer.projectName === "string") {
    return answer.projectName.trim();
  }

  return defaultName;
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
    const destinationPath = path.join(root, localPath.replace(".template", ""));
    fs.promises.mkdir(path.dirname(destinationPath), {
      recursive: true,
    });
    await fs.promises.writeFile(destinationPath, templateContent);
  };

  for (const path of templateManifest) {
    await renderTemplate(path, {
      projectName,
    });
  }

  process.chdir(root);

  console.log();
  console.log("Installing packages...");
  console.log();

  const dependencies = [
    "typescript",
    "functionless",
    "@functionless/ast-reflection",
    "@functionless/language-service",
    "aws-sdk",
    "typesafe-dynamodb",
    "aws-cdk",
    "aws-cdk-lib",
    "@aws-cdk/aws-appsync-alpha",
    "constructs",
    "esbuild",
  ];

  spawn.sync("yarn", ["add", "-D", ...dependencies], {
    stdio: "inherit",
  });

  console.log();
  console.log("Initializing git repository...");
  console.log();

  spawn.sync("git", ["init", "-q", "-b", "main"], {
    stdio: "inherit",
  });

  spawn.sync("git", ["add", "."], {
    stdio: "inherit",
  });

  spawn.sync("git", ["commit", "-q", "-m", "initial commit"], {
    stdio: "inherit",
  });

  console.log(chalk.green("Project ready!"));
  console.log();
  console.log(`Run ${chalk.yellow(`cd ./${projectName}`)} to get started.`);
}

run();
