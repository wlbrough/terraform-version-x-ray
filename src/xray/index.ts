import { languages, ExtensionContext, TextDocument, Uri } from "vscode";

import { Package } from "../package/Package";
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
  return packages.map((pkg) => {
    const { sourceRange, versionRange } = pkg;

    return new XRay(
      sourceRange,
      versionRange,
      pkg,
      Uri.file(document.fileName)
    );
  });
}
