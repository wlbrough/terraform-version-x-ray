import got from "got";
import * as semver from "semver";

import {
  Suggestion,
  SuggestionError,
  SuggestionErrorTypes,
} from "../suggestion";

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

export async function getTerraformRegistryVersionSuggestion(
  source: string,
  version: string
): Promise<Suggestion | SuggestionError> {
  try {
    const repositoryResponse: TerraformRegistryResponse = await got(
      `https://registry.terraform.io/v1/providers/${source}`
    ).json();

    const currentVersion =
      semver.coerce(version)?.version || version.replace(/[\s<>=~]+/g, "");
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
  } catch (e) {
    // TODO: Differentiate error types
    return {
      errorType: SuggestionErrorTypes.unexpected,
      errorMessage: "Unexpected error fetching version data",
    };
  }
}
