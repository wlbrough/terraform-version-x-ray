export const extractSymbolFromVersionRegex = /^([^0-9]*)?.*$/;
export const semverLeadingChars = ["<", "<=", ">", ">=", "~>"];
export function replaceVersion(
  existingVersion: string,
  newVersion: string
): string {
  const regExResult = extractSymbolFromVersionRegex.exec(existingVersion);
  const leading = regExResult && regExResult[1];
  if (!leading || !semverLeadingChars.includes(leading)) {
    return newVersion;
  }

  return `${leading}${newVersion}`;
}
