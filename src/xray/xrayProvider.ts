import {
  CodeLensProvider,
  CodeLens,
  EventEmitter,
  Event,
  TextDocument,
  Position,
  workspace,
} from "vscode";
import * as semver from "semver";
import got from "got";

import { XRay, createXRaysFromPackages } from "./xray";
import { Package } from "../package/Package";

type TerraformRegistryResponse = {
  id: string;
  owner: string;
  namespace: string;
  name: string;
  alias: string;
  version: string;
  tag: string;
  description: string;
  source: string;
  published_at: string;
  downloads: number;
  tier: string;
  logo_url: string;
  versions: string[];
  docs?: any[];
};

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

      const suggestion = await this.getVersionSuggestion(
        codeLens.package.current.source,
        codeLens.package.current.version
      );

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
            source,
            version,
          },
        };
        packages.push(pkg);
      }
    }
    return packages;
  }

  private async getVersionSuggestion(
    source: string,
    version: string
  ): Promise<{
    latest: string;
    greatestSatisfied: string;
    satisfiesLatest: boolean;
    currentVersion: string | undefined;
  }> {
    // TODO: all of the error handling
    const repositoryResponse: TerraformRegistryResponse = await got(
      `https://registry.terraform.io/v1/providers/${source}`
    ).json();

    const currentVersion = semver.coerce(version)?.version;
    let greatestSatisfied = currentVersion;
    if (semver.satisfies(repositoryResponse.version, version)) {
      greatestSatisfied = repositoryResponse.version;
    } else {
      const matchingVersions = repositoryResponse.versions.filter((v) =>
        semver.satisfies(v, version)
      );
      greatestSatisfied =
        matchingVersions.length > 0
          ? matchingVersions[matchingVersions.length - 1]
          : version;
    }
    const latest = repositoryResponse.version;
    const satisfiesLatest = latest === greatestSatisfied;

    return { latest, greatestSatisfied, satisfiesLatest, currentVersion };
  }
}
