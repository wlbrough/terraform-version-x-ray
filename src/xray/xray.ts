import { CodeLens, Range, Uri } from "vscode";

import { Package, PackageSourceTypes, PackageResponseErrors } from "../package";

export class XRay extends CodeLens {
  replaceRange: Range;
  package: Package;
  documentUrl: Uri;
  command: any;
  commandPosition: number;

  constructor(
    commandRange: Range,
    replaceRange: Range,
    packageResponse: Package,
    documentUrl: Uri,
    commandPosition: number
  ) {
    super(commandRange);
    this.replaceRange = replaceRange || commandRange;
    this.package = packageResponse;
    this.documentUrl = documentUrl;
    this.commandPosition = commandPosition;
    this.command = null;
  }

  hasPackageSource(source: PackageSourceTypes): boolean {
    return this.package.source === source;
  }

  hasPackageError(error: PackageResponseErrors): boolean {
    return this.package.error === error;
  }

  setCommand(title: string, command: string, args: any[]): XRay {
    this.command = {
      title,
      command,
      arguments: args,
    };
    return this;
  }
}
