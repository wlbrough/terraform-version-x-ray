import {
  CodeLensProvider,
  CodeLens,
  EventEmitter,
  Event,
  TextDocument,
  workspace,
} from "vscode";

import { parseProviders } from "../parser";
import { getTerraformRegistryVersionSuggestion } from "../registry";
import { XRay, createXRaysFromPackages } from "../xray";

export class XRayProvider implements CodeLensProvider {
  private codeLenses: CodeLens[] = [];
  private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
  public readonly onDidChangeCodeLenses: Event<void> =
    this._onDidChangeCodeLenses.event;

  constructor() {
    workspace.onDidChangeConfiguration(() => {
      this._onDidChangeCodeLenses.fire();
    });
  }

  public provideCodeLenses(
    document: TextDocument
  ): CodeLens[] | Thenable<CodeLens[]> {
    if (
      workspace
        .getConfiguration("terraform-version-x-ray")
        .get("enableCodeLens", true)
    ) {
      const packages = parseProviders(document);
      this.codeLenses = createXRaysFromPackages(document, packages);
      return this.codeLenses;
    }
    return [];
  }

  public async resolveCodeLens(codeLens: XRay): Promise<XRay | null> {
    if (
      workspace
        .getConfiguration("terraform-version-x-ray")
        .get("enableCodeLens", true)
    ) {
      return await this.createSuggestedVersionCommand(codeLens);
    }
    return null;
  }

  private async createSuggestedVersionCommand(codeLens: XRay) {
    try {
      if (
        !codeLens.package.current?.source ||
        !codeLens.package.current?.version
      ) {
        return null;
      }

      if (!codeLens.package.suggestion) {
        codeLens.package.suggestion = {
          source: codeLens.package.current.source,
          version: codeLens.package.current.version,
        };
      }

      const suggestion = await getTerraformRegistryVersionSuggestion(
        codeLens.package.current.source,
        codeLens.package.current.version
      );

      if ("errorType" in suggestion) {
        return null;
      }

      // TODO: I think this requires multiple lenses on the same line
      /* if (suggestion.currentVersion === suggestion.latest) {
        return codeLens.setCommand(
          "satisfies latest",
          "terraform-version-x-ray.updateDependency",
          [codeLens, null]
        );
      } else if (suggestion.satisfiesLatest) {
        codeLens.setCommand(
          "satisfies latest",
          "terraform-version-x-ray.updateDependency",
          [codeLens, null]
        );
      } else {
        codeLens.setCommand(
          `satisfies \u2191 ${suggestion.greatestSatisfied}`,
          "terraform-version-x-ray.updateDependency",
          [codeLens, `${suggestion.greatestSatisfied}`]
        );
      } */

      return codeLens.setCommand(
        `\u2191 ${suggestion.latest}`,
        "terraform-version-x-ray.updateDependency",
        [codeLens, `${suggestion.latest}`]
      );
    } catch (e) {
      console.error("Create Command Error");
      console.error(e);
      return codeLens;
    }
  }
}
