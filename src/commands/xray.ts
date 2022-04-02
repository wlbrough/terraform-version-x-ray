import { commands, workspace, ExtensionContext, WorkspaceEdit } from "vscode";

import { XRay } from "../xray/xray";

export async function registerXRayCommands(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand("terraform-version-x-ray.enableCodeLens", () => {
      workspace
        .getConfiguration("terraform-version-x-ray")
        .update("enableCodeLens", true, true);
    })
  );
  context.subscriptions.push(
    commands.registerCommand("terraform-version-x-ray.disableCodeLens", () => {
      workspace
        .getConfiguration("terraform-version-x-ray.disableCodeLens")
        .update("enableCodeLens", false, true);
    })
  );

  context.subscriptions.push(
    commands.registerCommand(
      "terraform-version-x-ray.updateDependency",
      (codeLens: XRay, packageVersion: string) => {
        if ((<any>codeLens).__replaced) {
          return Promise.resolve();
        }

        // TODO: fix replace logic to preserve/replace constraints properly
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
