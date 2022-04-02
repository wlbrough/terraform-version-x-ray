// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext } from "vscode";

import { registerXRayCommands } from "./commands/xray";
import { registerXRayProvider } from "./xray";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
  const provider = await registerXRayProvider(context);
  registerXRayCommands(context, provider);
}

// this method is called when your extension is deactivated
export function deactivate() {}
