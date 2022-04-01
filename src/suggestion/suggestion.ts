export type Suggestion = {
  latest: string;
  greatestSatisfied: string;
  satisfiesLatest: boolean;
  currentVersion: string;
};

export enum SuggestionErrorTypes {
  notFound = "NotFound",
  notSupported = "NotSupported",
  gitNotFound = "GitNotFound",
  invalidVersion = "InvalidVersion",
  unexpected = "Unexpected",
}

export type SuggestionError = {
  errorType: SuggestionErrorTypes;
  errorMessage: string;
};
