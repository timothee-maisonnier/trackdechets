import prisma from "../prisma";
import redundantCachedSearchSirene from "./sirene/searchCompany";
import decoratedSearchCompanies from "./sirene/searchCompanies";
import { UserInputError } from "apollo-server-express";
import { CompanySearchResult } from "./types";
import { searchVat } from "./vat";
import { convertUrls } from "./database";
import {
  isSiret,
  isVat,
  isFRVat
} from "../common/constants/companySearchHelpers";
import { SireneSearchResult } from "./sirene/types";
import { CompanyVatSearchResult } from "./vat/vies/types";
import { AnonymousCompanyError } from "./sirene/errors";

interface SearchCompaniesDeps {
  searchCompany: (clue: string) => Promise<CompanySearchResult>;
}

const SIRET_OR_VAT_ERROR =
  "Il est obligatoire de rechercher soit avec un SIRET de 14 caractères soit avec un numéro de TVA intracommunautaire valide";

/**
 * Search one company by SIRET or VAT number
 * Supports Test SIRET and AnonymousCompany
 */
export async function searchCompany(
  clue: string
): Promise<CompanySearchResult> {
  // remove whitespaces
  const cleanClue = clue.replace(/\s/g, "").toUpperCase();
  if (!cleanClue || (!isSiret(cleanClue) && !isVat(cleanClue))) {
    throw new UserInputError(SIRET_OR_VAT_ERROR, {
      invalidArgs: ["siret", "clue"]
    });
  }
  let companyInfo: SireneSearchResult | CompanyVatSearchResult;
  // search for test or anonymous companies first
  const anonymousCompany = await prisma.anonymousCompany.findUnique({
    where: { siret: cleanClue }
  });
  if (anonymousCompany) {
    companyInfo = {
      ...anonymousCompany,
      statutDiffusionEtablissement: cleanClue.startsWith("000000") ? "O" : "N",
      etatAdministratif: "A",
      naf: anonymousCompany.codeNaf,
      codePaysEtrangerEtablissement: "FR"
    };
  } else if (
    process.env.ALLOW_TEST_COMPANY === "true" &&
    cleanClue.startsWith("000000")
  ) {
    // 404
    throw new UserInputError("Aucun établissement trouvé avec ce SIRET", {
      invalidArgs: ["siret", "clue"]
    });
  } else {
    // Search public company databases
    if (isSiret(cleanClue)) {
      companyInfo = await searchSireneOrNotFound(cleanClue);
    } else if (isVat(cleanClue)) {
      companyInfo = await searchVatFrOnlyOrNotFound(cleanClue);
    }
  }

  // append Company data
  // data is null if the company is not registered in TD
  const where = {
    ...(isSiret(cleanClue) && { where: { siret: cleanClue } }),
    ...(isVat(cleanClue) && { where: { vatNumber: cleanClue } })
  };
  const trackdechetsCompanyInfo = await prisma.company.findUnique({
    ...where,
    select: {
      id: true,
      siret: true,
      name: true,
      address: true,
      vatNumber: true,
      companyTypes: true,
      contactEmail: true,
      contactPhone: true,
      website: true,
      ecoOrganismeAgreements: true,
      allowBsdasriTakeOverWithoutSignature: true
    }
  });

  return {
    // ensure compatibility with CompanyPublic
    ecoOrganismeAgreements: [],
    isRegistered: trackdechetsCompanyInfo != null,
    companyTypes: trackdechetsCompanyInfo?.companyTypes ?? [],
    ...convertUrls(trackdechetsCompanyInfo),
    ...companyInfo
  };
}

// used for dependency injection in tests to easily mock `searchCompany`
export const makeSearchCompanies =
  ({ searchCompany }: SearchCompaniesDeps) =>
  (clue: string, department?: string) => {
    // clue can be formatted like a SIRET or a VAT number
    // but we don't want to search  for VAT numbers
    if (isSiret(clue)) {
      return searchCompany(clue)
        .then(c =>
          // Exclude closed companies
          [c].filter(c => c.etatAdministratif && c.etatAdministratif === "A")
        )
        .catch(_ => []);
    }
    return decoratedSearchCompanies(clue, department);
  };

async function searchSireneOrNotFound(
  siret: string
): Promise<SireneSearchResult> {
  try {
    return await redundantCachedSearchSirene(siret);
  } catch (err) {
    // The SIRET was not found in public data
    // Try searching the anonymous companies
    const anonymousCompany = await prisma.anonymousCompany.findUnique({
      where: { siret }
    });
    if (anonymousCompany) {
      return {
        ...anonymousCompany,
        // required to avoid leaking anonymous data to the public
        statutDiffusionEtablissement: "N",
        etatAdministratif: "A",
        naf: anonymousCompany.codeNaf,
        codePaysEtrangerEtablissement: "FR"
      };
    } else if (err instanceof AnonymousCompanyError) {
      // And it's finally an anonymous that is not found in AnonymousCompany
      return {
        siret,
        statutDiffusionEtablissement: "N"
      } as SireneSearchResult;
    }

    throw err;
  }
}

async function searchVatFrOnlyOrNotFound(
  vatNumber: string
): Promise<CompanyVatSearchResult> {
  if (isFRVat(vatNumber)) {
    throw new UserInputError(
      "Une entreprise française doit être identifiée par son SIRET et pas par sa TVA intracommunautaire",
      {
        invalidArgs: ["clue"]
      }
    );
  }
  // throws UserInputError if not found
  const result = await searchVat(vatNumber);
  return {
    ...result,
    // to ensure compatibility with the common type
    statutDiffusionEtablissement: "O"
  };
}

export const searchCompanies = makeSearchCompanies({ searchCompany });
