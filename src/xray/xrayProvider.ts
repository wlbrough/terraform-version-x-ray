import {
  CodeLensProvider,
  CodeLens,
  EventEmitter,
  Event,
  TextDocument,
  Position,
  workspace,
} from "vscode";

import { XRay, createXRaysFromPackages } from "./xray";
import { Package } from "../package/Package";

export class XRayProvider implements CodeLensProvider {
  private codeLenses: CodeLens[] = [];
  private regex: RegExp;
  private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
  public readonly onDidChangeCodeLenses: Event<void> =
    this._onDidChangeCodeLenses.event;

  constructor() {
    this.regex =
      /source\s*=\s*"([A-Za-z0-9\/]+)"\s*\n?\s*version\s*=\s*"([A-Za-z0-9\.<>=~ ]+)"/g;

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
      const packages = this.parseProviders(document);
      this.codeLenses = createXRaysFromPackages(document, packages);
      return this.codeLenses;
    }
    return [];
  }

  public resolveCodeLens(codeLens: XRay): XRay | null {
    if (
      workspace
        .getConfiguration("terraform-version-x-ray")
        .get("enableCodeLens", true)
    ) {
      return this.createSuggestedVersionCommand(codeLens);
    }
    return null;
  }

  private createSuggestedVersionCommand(codeLens: XRay) {
    if (!codeLens.package.suggestion?.version) {
      return null;
    }

    const { version } = codeLens.package.suggestion;
    return codeLens.setCommand(
      `\u2191 ${version}`,
      "terraform-version-x-ray.updateDependency",
      [codeLens, `${version}`]
    );
  }

  private parseProviders(document: TextDocument): Package[] {
    let packages: Package[] = [];
    const text = document.getText();
    let matches;
    while ((matches = this.regex.exec(text)) !== null) {
      if (matches.length !== 3) {
        continue; // TODO: May need some error handling here
      }

      const [fullMatch, source, version] = matches;

      const sourceOffset = fullMatch.indexOf(source);
      const versionOffset = fullMatch.indexOf(version);
      const sourceLine = document.lineAt(
        document.positionAt(matches.index + sourceOffset).line
      );
      const versionLine = document.lineAt(
        document.positionAt(matches.index + versionOffset).line
      );
      const sourceLineIndex = sourceLine.text.indexOf(source);
      const versionLineIndex = versionLine.text.indexOf(version);
      const sourcePosition = new Position(
        sourceLine.lineNumber,
        sourceLineIndex
      );
      const versionPosition = new Position(
        versionLine.lineNumber,
        versionLineIndex
      );
      const sourceRange = document.getWordRangeAtPosition(
        sourcePosition,
        new RegExp(source)
      );
      const versionRange = document.getWordRangeAtPosition(
        versionPosition,
        new RegExp(version)
      );
      // TODO: sourcetype and versiontype
      if (sourceRange && versionRange) {
        let pkg: Package = {
          sourceRange,
          versionRange,
          order: packages.length,
          current: {
            source,
            version,
          },
          suggestion: {
            // TODO: fix this
            source,
            version,
          },
        };
        packages.push(pkg);
      }
    }
    return packages;
  }
}
