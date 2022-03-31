// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  ExtensionContext,
  commands,
  workspace,
  window,
  languages,
} from "vscode";
import { XRayProvider } from "./XRayProvider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "terraform-version-x-ray" is now active!'
  );

  const xRayProvider = new XRayProvider();

  let provider = languages.registerCodeLensProvider("*", xRayProvider);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let enable = commands.registerCommand(
    "terraform-version-x-ray.enableCodeLens",
    () => {
      workspace
        .getConfiguration("terraform-version-x-ray")
        .update("enableCodeLens", true, true);
    }
  );

  let disable = commands.registerCommand(
    "terraform-version-x-ray.disableCodeLens",
    () => {
      workspace
        .getConfiguration("terraform-version-x-ray.disableCodeLens")
        .update("enableCodeLens", false, true);
    }
  );

  let action = commands.registerCommand(
    "terraform-version-x-ray.codelensAction",
    (args: any) => {
      window.showInformationMessage(`Action clicked with args=${args}`);
    }
  );

  context.subscriptions.push(enable);
  context.subscriptions.push(disable);
  context.subscriptions.push(action);
  context.subscriptions.push(provider);
}

// this method is called when your extension is deactivated
export function deactivate() {}
