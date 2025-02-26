import { CompanyType } from "@prisma/client";
import { resetDatabase } from "../../../../../integration-tests/helper";
import { AuthType } from "../../../../auth";
import prisma from "../../../../prisma";
import { TestQuery } from "../../../../__tests__/apollo-integration-testing";
import { companyFactory, userFactory } from "../../../../__tests__/factories";
import makeClient from "../../../../__tests__/testClient";
import { AnonymousCompanyError } from "../../../sirene/errors";
import * as searchCompany from "../../../sirene/searchCompany";

const searchSirene = jest.spyOn(searchCompany, "default");

describe("query { companyPrivateInfos(clue: <SIRET>) }", () => {
  let query: TestQuery;
  beforeAll(async () => {
    const user = await userFactory();
    const testClient = makeClient({
      ...user,
      auth: AuthType.Session
    });
    query = testClient.query;
  });

  afterEach(async () => {
    await resetDatabase();
    searchSirene.mockReset();
  });

  it("Random company not registered in Trackdéchets", async () => {
    searchSirene.mockResolvedValueOnce({
      siret: "85001946400013",
      etatAdministratif: "A",
      name: "CODE EN STOCK",
      address: "4 Boulevard Longchamp 13001 Marseille",
      codeCommune: "13201",
      naf: "62.01Z",
      libelleNaf: "Programmation informatique",
      addressVoie: "4 boulevard Longchamp",
      addressCity: "Marseille",
      addressPostalCode: "13001"
    });

    const gqlquery = `
      query {
        companyPrivateInfos(clue: "85001946400013") {
          siret
          isAnonymousCompany
          etatAdministratif
          name
          address
          naf
          libelleNaf
          isRegistered
          companyTypes
          contactEmail
          contactPhone
          website
          installation {
            codeS3ic
          }
        }
      }`;
    const response = await query<any>(gqlquery);

    expect(response.data.companyPrivateInfos).toEqual({
      siret: "85001946400013",
      etatAdministratif: "A",
      name: "CODE EN STOCK",
      address: "4 Boulevard Longchamp 13001 Marseille",
      naf: "62.01Z",
      libelleNaf: "Programmation informatique",
      isRegistered: false,
      companyTypes: [],
      contactEmail: null,
      contactPhone: null,
      website: null,
      installation: null,
      isAnonymousCompany: false
    });
  });

  it("ICPE registered in Trackdéchets", async () => {
    searchSirene.mockResolvedValueOnce({
      siret: "85001946400013",
      etatAdministratif: "A",
      name: "CODE EN STOCK",
      address: "4 Boulevard Longchamp 13001 Marseille",
      codeCommune: "13201",
      naf: "62.01Z",
      libelleNaf: "Programmation informatique",
      addressVoie: "4 boulevard Longchamp",
      addressCity: "Marseille",
      addressPostalCode: "13001"
    });

    await companyFactory({
      siret: "85001946400013",
      name: "Code en Stock",
      contactEmail: "john.snow@trackdechets.fr",
      contactPhone: "0600000000",
      website: "https://trackdechets.beta.gouv.fr",
      companyTypes: {
        set: [CompanyType.WASTEPROCESSOR]
      }
    });

    await prisma.installation.create({
      data: {
        s3icNumeroSiret: "85001946400013",
        codeS3ic: "0064.00001"
      }
    });
    const gqlquery = `
      query {
        companyPrivateInfos(clue: "85001946400013") {
          siret
          etatAdministratif
          name
          address
          naf
          libelleNaf
          isRegistered
          companyTypes
          contactEmail
          contactPhone
          website
          installation {
            codeS3ic
          }
          isAnonymousCompany
        }
      }`;
    const response = await query<any>(gqlquery);
    // informations from insee, TD and ICPE database are merged
    expect(response.data.companyPrivateInfos).toEqual({
      siret: "85001946400013",
      etatAdministratif: "A",
      name: "CODE EN STOCK",
      address: "4 Boulevard Longchamp 13001 Marseille",
      naf: "62.01Z",
      libelleNaf: "Programmation informatique",
      isRegistered: true,
      companyTypes: [CompanyType.WASTEPROCESSOR],
      contactEmail: "john.snow@trackdechets.fr",
      contactPhone: "0600000000",
      website: "https://trackdechets.beta.gouv.fr",
      installation: {
        codeS3ic: "0064.00001"
      },
      isAnonymousCompany: false
    });
  });

  it("Transporter company with transporter receipt", async () => {
    const vatNumber = "85001946400013";
    searchSirene.mockResolvedValueOnce({
      siret: null,
      vatNumber,
      etatAdministratif: "A",
      name: "CODE EN STOCK",
      address: "4 Boulevard Longchamp 13001 Marseille",
      codeCommune: "13201",
      naf: "62.01Z",
      libelleNaf: "Programmation informatique",
      addressVoie: "4 boulevard Longchamp",
      addressCity: "Marseille",
      addressPostalCode: "13001"
    });

    const receipt = {
      receiptNumber: "receiptNumber",
      validityLimit: "2021-03-31T00:00:00.000Z",
      department: "07"
    };

    await companyFactory({
      vatNumber,
      name: "Code en Stock",
      securityCode: 1234,
      contactEmail: "john.snow@trackdechets.fr",
      contactPhone: "0600000000",
      website: "https://trackdechets.beta.gouv.fr",
      transporterReceipt: { create: receipt }
    });

    const gqlquery = `
      query {
        companyPrivateInfos(clue: "85001946400013") {
          vatNumber
          isAnonymousCompany
          transporterReceipt {
            receiptNumber
            validityLimit
            department
          }
        }
      }`;
    const response = await query<any>(gqlquery);
    expect(response.data.companyPrivateInfos.transporterReceipt).toEqual(
      receipt
    );
    expect(response.data.companyPrivateInfos.vatNumber).toEqual(vatNumber);
    expect(response.data.companyPrivateInfos.isAnonymousCompany).toBeFalsy();
  });

  it("Trader company with trader receipt", async () => {
    searchSirene.mockResolvedValueOnce({
      siret: "85001946400013",
      etatAdministratif: "A",
      name: "CODE EN STOCK",
      address: "4 Boulevard Longchamp 13001 Marseille",
      codeCommune: "13201",
      naf: "62.01Z",
      libelleNaf: "Programmation informatique",
      addressVoie: "4 boulevard Longchamp",
      addressCity: "Marseille",
      addressPostalCode: "13001"
    });

    const receipt = {
      receiptNumber: "receiptNumber",
      validityLimit: "2021-03-31T00:00:00.000Z",
      department: "07"
    };

    await companyFactory({
      siret: "85001946400013",
      name: "Code en Stock",
      securityCode: 1234,
      contactEmail: "john.snow@trackdechets.fr",
      contactPhone: "0600000000",
      website: "https://trackdechets.beta.gouv.fr",
      traderReceipt: { create: receipt }
    });

    const gqlquery = `
      query {
        companyPrivateInfos(clue: "85001946400013") {
          traderReceipt {
            receiptNumber
            validityLimit
            department
          }
        }
      }`;
    const response = await query<any>(gqlquery);
    expect(response.data.companyPrivateInfos.traderReceipt).toEqual(receipt);
  });

  it("Company with direct dasri takeover allowance", async () => {
    searchSirene.mockResolvedValueOnce({
      siret: "85001946400013",
      etatAdministratif: "A",
      name: "CODE EN STOCK",
      address: "4 Boulevard Longchamp 13001 Marseille",
      codeCommune: "13201",
      naf: "62.01Z",
      libelleNaf: "Programmation informatique",
      addressVoie: "4 boulevard Longchamp",
      addressCity: "Marseille",
      addressPostalCode: "13001"
    });

    await companyFactory({
      siret: "85001946400013",
      name: "Code en Stock",
      securityCode: 1234,
      contactEmail: "john.snow@trackdechets.fr",
      contactPhone: "0600000000",
      website: "https://trackdechets.beta.gouv.fr",
      allowBsdasriTakeOverWithoutSignature: true
    });

    const gqlquery = `
      query {
        companyPrivateInfos(clue: "85001946400013") {
          allowBsdasriTakeOverWithoutSignature
          isRegistered
        }
      }`;
    const response = await query<any>(gqlquery);
    expect(
      response.data.companyPrivateInfos.allowBsdasriTakeOverWithoutSignature
    ).toEqual(true);
    expect(response.data.companyPrivateInfos.isRegistered).toEqual(true);
  });

  it("Closed company in INSEE public data", async () => {
    searchSirene.mockResolvedValueOnce({
      siret: "41268783200011",
      etatAdministratif: "F",
      name: "OPTIQUE LES AIX",
      address: "49 Rue de la République 18220 Les Aix-d'Angillon"
    });
    const gqlquery = `
    query {
      companyPrivateInfos(clue: "41268783200011") {
        siret
        etatAdministratif
        name
        address
        naf
        libelleNaf
        isRegistered
        contactEmail
        contactPhone
        website
        installation {
          codeS3ic
        }
      }
    }`;
    const response = await query<any>(gqlquery);
    const company = response.data.companyPrivateInfos;
    const expected = {
      siret: "41268783200011",
      etatAdministratif: "F",
      name: "OPTIQUE LES AIX",
      address: "49 Rue de la République 18220 Les Aix-d'Angillon",
      isRegistered: false,
      contactEmail: null,
      contactPhone: null,
      installation: null,
      naf: null,
      libelleNaf: null,
      website: null
    };
    expect(company).toEqual(expected);
  });

  it("Hidden company in INSEE and not registered", async () => {
    searchSirene.mockRejectedValueOnce(new AnonymousCompanyError());
    const gqlquery = `
      query {
        companyPrivateInfos(clue: "43317467900046") {
          siret
          etatAdministratif
          name
          address
          naf
          libelleNaf
          isRegistered
          statutDiffusionEtablissement
          contactEmail
          contactPhone
          website
          installation {
            codeS3ic
          }
        }
      }`;
    const { data } = await query<any>(gqlquery);
    expect(data.companyPrivateInfos).toMatchObject({
      address: null,
      contactEmail: null,
      contactPhone: null,
      etatAdministratif: null,
      installation: null,
      isRegistered: false,
      statutDiffusionEtablissement: "N",
      libelleNaf: null,
      naf: null,
      name: null,
      siret: "43317467900046",
      website: null
    });
  });

  it("Hidden company in INSEE and but registered without AnonymousCompany", async () => {
    searchSirene.mockRejectedValueOnce(new AnonymousCompanyError());
    const company = await companyFactory({
      siret: "85001946400013",
      name: "Code en Stock",
      contactEmail: "john.snow@trackdechets.fr",
      contactPhone: "0600000000",
      website: "https://trackdechets.beta.gouv.fr",
      companyTypes: {
        set: [CompanyType.WASTEPROCESSOR]
      }
    });
    const gqlquery = `
      query {
        companyPrivateInfos(clue: "85001946400013") {
          siret
          etatAdministratif
          name
          address
          naf
          libelleNaf
          isRegistered
          statutDiffusionEtablissement
          isAnonymousCompany
          contactEmail
          contactPhone
          website
          companyTypes
        }
      }`;
    const { data } = await query<any>(gqlquery);
    expect(data.companyPrivateInfos).toMatchObject({
      siret: company.siret,
      name: company.name,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      website: company.website,
      companyTypes: [CompanyType.WASTEPROCESSOR],
      etatAdministratif: null,
      isRegistered: true,
      statutDiffusionEtablissement: "N",
      isAnonymousCompany: false,
      libelleNaf: null,
      naf: null
    });
  });

  it("Hidden company in INSEE, AnonymousCompany created and but not registered", async () => {
    const createInput = {
      siret: "50000012345698",
      name: "Établissement de test",
      address: "Adresse test",
      codeNaf: "XXXXX",
      libelleNaf: "Entreprise de test",
      codeCommune: "00000"
    };
    const anoCompany = await prisma.anonymousCompany.create({
      data: createInput
    });
    const gqlquery = `
      query {
        companyPrivateInfos(clue: "50000012345698") {
          siret
          etatAdministratif
          name
          address
          naf
          libelleNaf
          isRegistered
          statutDiffusionEtablissement
          isAnonymousCompany
          contactEmail
          contactPhone
          website
        }
      }`;
    const { data } = await query<any>(gqlquery);
    expect(data.companyPrivateInfos).toMatchObject({
      siret: anoCompany.siret,
      name: anoCompany.name,
      address: anoCompany.address,
      libelleNaf: anoCompany.libelleNaf,
      etatAdministratif: "A",
      isRegistered: false,
      statutDiffusionEtablissement: "N",
      isAnonymousCompany: true
    });
  });

  it("Hidden company in INSEE, AnonymousCompany for Test is created and but not registered", async () => {
    const createInput = {
      siret: "00000012345698",
      name: "Établissement de test",
      address: "Adresse test",
      codeNaf: "XXXXX",
      libelleNaf: "Entreprise de test",
      codeCommune: "00000"
    };
    const anoCompany = await prisma.anonymousCompany.create({
      data: createInput
    });
    const gqlquery = `
      query {
        companyPrivateInfos(clue: "00000012345698") {
          siret
          etatAdministratif
          name
          address
          naf
          libelleNaf
          isRegistered
          statutDiffusionEtablissement
          isAnonymousCompany
          contactEmail
          contactPhone
          website
        }
      }`;
    const { data } = await query<any>(gqlquery);
    expect(data.companyPrivateInfos).toMatchObject({
      siret: anoCompany.siret,
      name: anoCompany.name,
      address: anoCompany.address,
      libelleNaf: anoCompany.libelleNaf,
      etatAdministratif: "A",
      isRegistered: false,
      statutDiffusionEtablissement: "O",
      isAnonymousCompany: true
    });
  });

  it("Hidden company in INSEE, AnonymousCompany created and registered", async () => {
    const createInput = {
      siret: "50000012345698",
      name: "Établissement de test",
      address: "Adresse test",
      codeNaf: "XXXXX",
      libelleNaf: "Entreprise de test",
      codeCommune: "00000",
      vatNumber: "IT123"
    };
    await prisma.anonymousCompany.create({
      data: createInput
    });
    const company = await companyFactory({
      siret: createInput.siret,
      name: createInput.name,
      address: createInput.address
    });
    const gqlquery = `
      query {
        companyPrivateInfos(clue: "50000012345698") {
          siret
          vatNumber
          etatAdministratif
          name
          address
          naf
          libelleNaf
          isRegistered
          statutDiffusionEtablissement
          isAnonymousCompany
          contactEmail
          contactPhone
          website
          installation {
            codeS3ic
          }
        }
      }`;
    const { data } = await query<any>(gqlquery);
    expect(data.companyPrivateInfos).toMatchObject({
      address: company.address,
      name: company.name,
      siret: company.siret,
      vatNumber: createInput.vatNumber,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      website: company.website,
      installation: null,
      libelleNaf: createInput.libelleNaf,
      etatAdministratif: "A",
      isRegistered: true,
      statutDiffusionEtablissement: "N",
      isAnonymousCompany: true
    });
  });

  it("Hidden company in INSEE, AnonymousCompany for TEST created and registered", async () => {
    const createInput = {
      siret: "00000012345698",
      name: "Établissement de test",
      address: "Adresse test",
      codeNaf: "XXXXX",
      libelleNaf: "Entreprise de test",
      codeCommune: "00000"
    };
    await prisma.anonymousCompany.create({
      data: createInput
    });
    const company = await companyFactory({
      siret: createInput.siret,
      name: createInput.name,
      address: createInput.address
    });
    const gqlquery = `
      query {
        companyPrivateInfos(clue: "00000012345698") {
          siret
          vatNumber
          etatAdministratif
          name
          address
          naf
          libelleNaf
          isRegistered
          statutDiffusionEtablissement
          isAnonymousCompany
          contactEmail
          contactPhone
          website
          installation {
            codeS3ic
          }
        }
      }`;
    const { data } = await query<any>(gqlquery);
    expect(data.companyPrivateInfos).toMatchObject({
      address: company.address,
      name: company.name,
      siret: company.siret,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      website: company.website,
      installation: null,
      libelleNaf: createInput.libelleNaf,
      etatAdministratif: "A",
      isRegistered: true,
      statutDiffusionEtablissement: "O",
      isAnonymousCompany: true
    });
  });
});
