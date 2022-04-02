import { languages, ExtensionContext, TextDocument, Uri } from "vscode";

import { Package } from "../package";
import { XRay } from "./xray";
import { XRayProvider } from "./xrayProvider";

export { XRay, XRayProvider };

export async function registerXRayProvider(context: ExtensionContext) {
  const xRayProvider = new XRayProvider();
  context.subscriptions.push(
    languages.registerCodeLensProvider("*", xRayProvider)
  );
}

export function createXRaysFromPackages(
  document: TextDocument,
  packages: Package[]
): XRay[] {
  const xrays = [];

  for (let pkg of packages) {
    const { sourceRange, versionRange } = pkg;

    // NOTE: creating two XRay objects per package to handle all upgrade cases.
    // One of these may be thrown away on CodeLens resolution if the package is
    // current with latest.
    xrays.push(
      new XRay(sourceRange, versionRange, pkg, Uri.file(document.fileName), 0)
    );
    xrays.push(
      new XRay(sourceRange, versionRange, pkg, Uri.file(document.fileName), 1)
    );
  }

  return xrays;
}
