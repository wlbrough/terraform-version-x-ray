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
import { Suggestion } from "../suggestion";
import { XRay, createXRaysFromPackages } from "../xray";

export class XRayProvider implements CodeLensProvider {
  private codeLenses: CodeLens[] = [];
  private enabled: boolean = true;
  private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
  public readonly onDidChangeCodeLenses: Event<void> =
    this._onDidChangeCodeLenses.event;

  constructor() {
    workspace.onDidChangeConfiguration(() => {
      this._onDidChangeCodeLenses.fire();
    });
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  public provideCodeLenses(
    document: TextDocument
  ): CodeLens[] | Thenable<CodeLens[]> {
    if (this.enabled) {
      const packages = parseProviders(document);
      this.codeLenses = createXRaysFromPackages(document, packages);
    } else {
      this.codeLenses = [];
    }

    return this.codeLenses;
  }

  public async resolveCodeLens(codeLens: XRay): Promise<XRay | null> {
    if (this.enabled) {
      return await this.createSuggestedVersionCommand(codeLens);
    }
    return null;
  }

  // TODO: Find a way to hide or remove the second CodeLens for a given
  // line if the current version is equal to latest (no second suggestion required).
  private async createSuggestedVersionCommand(
    codeLens: XRay
  ): Promise<XRay | null> {
    try {
      const { source, version } = codeLens.package.current;

      let suggestion: Suggestion;

      if (codeLens.package.suggestion) {
        suggestion = codeLens.package.suggestion;
      } else {
        const maybeSuggestion = await getTerraformRegistryVersionSuggestion(
          source,
          version
        );

        if ("errorType" in maybeSuggestion) {
          // TODO: Handle any errors
          return null;
        }

        suggestion = maybeSuggestion;
        codeLens.package.suggestion = maybeSuggestion;
      }

      if (codeLens.commandPosition === 0) {
        if (
          suggestion.currentVersion === suggestion.latest ||
          suggestion.satisfiesLatest
        ) {
          return codeLens.setCommand("satisfies latest", "", []);
        } else {
          return codeLens.setCommand(
            `satisfies \u2191 ${suggestion.greatestSatisfied}`,
            "terraform-version-x-ray.updateDependency",
            [codeLens, `${suggestion.greatestSatisfied}`]
          );
        }
      } else if (suggestion.currentVersion !== suggestion.latest) {
        return codeLens.setCommand(
          `latest \u2191 ${suggestion.latest}`,
          "terraform-version-x-ray.updateDependency",
          [codeLens, `${suggestion.latest}`]
        );
      }

      return null;
    } catch (e) {
      console.error("Create Command Error");
      console.error(e);
      return null;
    }
  }
}
