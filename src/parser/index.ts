import { Position, Range, TextDocument } from "vscode";

import { Package } from "../package";

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
    const sourceRange = getRange(document, matches.index, fullMatch, source);
    const versionRange = getRange(document, matches.index, fullMatch, version);

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
      };
      packages.push(pkg);
    }
  }
  return packages;
}

function getRange(
  document: TextDocument,
  matchIndex: number,
  regexMatch: string,
  target: string
): Range | undefined {
  const targetOffset = regexMatch.indexOf(target);
  const line = document.lineAt(
    document.positionAt(matchIndex + targetOffset).line
  );
  const lineIndex = line.text.indexOf(target);
  const position = new Position(line.lineNumber, lineIndex);

  return document.getWordRangeAtPosition(position, new RegExp(target));
}
