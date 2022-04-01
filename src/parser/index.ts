import { Position, TextDocument } from "vscode";

import { Package } from "../package/Package";

const providersRegex =
  /source\s*=\s*"([A-Za-z0-9\/]+)"\s*\n?\s*version\s*=\s*"([A-Za-z0-9\.<>=~ ]+)"/g;

export function parseProviders(document: TextDocument): Package[] {
  let packages: Package[] = [];
  const text = document.getText();
  let matches;
  while ((matches = providersRegex.exec(text)) !== null) {
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
    const sourcePosition = new Position(sourceLine.lineNumber, sourceLineIndex);
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
