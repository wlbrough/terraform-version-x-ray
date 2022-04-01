import { CodeLens, Range, Uri } from "vscode";

import {
  Package,
  PackageSourceTypes,
  PackageResponseErrors,
} from "../package/Package";

export class XRay extends CodeLens {
  replaceRange: Range;
  package: Package;
  documentUrl: Uri;
  command: any;

  constructor(
    commandRange: Range,
    replaceRange: Range,
    packageResponse: Package,
    documentUrl: Uri
  ) {
    super(commandRange);
    this.replaceRange = replaceRange || commandRange;
    this.package = packageResponse;
    this.documentUrl = documentUrl;
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
