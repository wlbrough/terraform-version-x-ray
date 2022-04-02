import { commands, workspace, ExtensionContext, WorkspaceEdit } from "vscode";

import { XRay, XRayProvider } from "../xray";

export async function registerXRayCommands(
  context: ExtensionContext,
  provider: XRayProvider
) {
  context.subscriptions.push(
    commands.registerCommand("terraform-version-x-ray.enableCodeLens", () => {
      provider.enable();
    })
  );
  context.subscriptions.push(
    commands.registerCommand("terraform-version-x-ray.disableCodeLens", () => {
      provider.disable();
    })
  );

  context.subscriptions.push(
    commands.registerCommand(
      "terraform-version-x-ray.updateDependency",
      (codeLens: XRay, packageVersion: string) => {
        if ((<any>codeLens).__replaced) {
          return Promise.resolve();
        }

        const edit = new WorkspaceEdit();
        edit.replace(
          codeLens.documentUrl,
          codeLens.replaceRange,
          packageVersion
        );

        return workspace
          .applyEdit(edit)
          .then(() => ((<any>codeLens).__replaced = true));
      }
    )
  );
}
