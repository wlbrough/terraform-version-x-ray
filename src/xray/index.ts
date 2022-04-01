import { ExtensionContext, languages } from "vscode";

import { XRayProvider } from "./xrayProvider";

export async function registerXRayProvider(context: ExtensionContext) {
  const xRayProvider = new XRayProvider();
  context.subscriptions.push(
    languages.registerCodeLensProvider("*", xRayProvider)
  );
}
