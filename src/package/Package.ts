import { Range } from "vscode";

import { Suggestion } from "../suggestion";

export enum PackageSourceTypes {
  directory = "directory",
  file = "file",
  git = "git",
  github = "github",
  registry = "registry",
}

export enum PackageVersionTypes {
  version = "version",
  range = "range",
  tag = "tag",
  alias = "alias",
  committish = "committish",
}

export enum PackageResponseErrors {
  none = "None",
  notFound = "NotFound",
  notSupported = "NotSupported",
  gitNotFound = "GitNotFound",
  invalidVersion = "InvalidVersion",
  unexpected = "Unexpected",
}

export type PackageSourceVersion = {
  source: string;
  version: string;
};

export type Package = {
  sourceRange: Range;
  versionRange: Range;
  order: number;

  error?: PackageResponseErrors;
  errorMessage?: string;
  source?: PackageSourceTypes;
  type?: PackageVersionTypes;
  current?: PackageSourceVersion;
  suggestion?: Suggestion;
};
