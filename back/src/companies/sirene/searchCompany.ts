import { searchCompany as searchCompanyInsee } from "./insee/client";
import { searchCompany as searchCompanyDataGouv } from "./entreprise.data.gouv.fr/client";
import { searchCompany as searchCompanySocialGouv } from "./social.gouv/client";
import { searchCompany as searchCompanyTD } from "./trackdechets/client";
import {
  backoffIfTestEnvs,
  backoffIfTooManyRequests,
  throttle
} from "./ratelimit";
import { redundant } from "./redundancy";
import { cache } from "./cache";

export const searchCompanyInseeThrottled = backoffIfTestEnvs(
  backoffIfTooManyRequests(searchCompanyInsee, {
    service: "insee"
  })
);

export const searchCompanyDataGouvThrottled = backoffIfTestEnvs(
  throttle(searchCompanyDataGouv, {
    service: "data_gouv",
    requestsPerSeconds: 8
  })
);

export const searchCompanySocialGouvThrottled = backoffIfTestEnvs(
  throttle(searchCompanySocialGouv, {
    service: "social_gouv",
    requestsPerSeconds: 50
  })
);

// list different implementations of searchCompany by order of priority.
// please keep searchCompanyTD then searchCompanyInseeThrottled in this order
// in order to preserve anonymous companies processing
const searchCompanyProviders = [
  searchCompanyTD,
  searchCompanyInseeThrottled,
  searchCompanyDataGouvThrottled,
  searchCompanySocialGouvThrottled
];

/**
 * Apply throttle, redundant and cache decorators to searchCompany functions
 * We use INSEE API in priority and fall back to entreprise.data.gouv.fr
 */
const decoratedSearchCompany = cache(redundant(...searchCompanyProviders));

export default function searchCompany(siret: string) {
  return decoratedSearchCompany(siret);
}
