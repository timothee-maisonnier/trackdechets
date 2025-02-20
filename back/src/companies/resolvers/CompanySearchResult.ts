import prisma from "../../prisma";
import { CompanySearchResultResolvers } from "../../generated/graphql/types";
import { CompanyBaseIdentifiers } from "../types";

/**
 * For nested data resolvers of Company derivatives
 * in order to find the parent Company
 */
export const whereSiretOrVatNumber = (parent: CompanyBaseIdentifiers) => {
  if (!!parent.siret) {
    return { siret: parent.siret };
  } else if (!!parent.vatNumber) {
    return { vatNumber: parent.vatNumber };
  }
};

const companySearchResultResolvers: CompanySearchResultResolvers = {
  transporterReceipt: async parent => {
    const transporterReceipt = await prisma.company
      .findUnique({
        where: whereSiretOrVatNumber(parent as CompanyBaseIdentifiers)
      })
      .transporterReceipt();
    return transporterReceipt;
  },
  traderReceipt: async parent => {
    const traderReceipt = await prisma.company
      .findUnique({
        where: whereSiretOrVatNumber(parent as CompanyBaseIdentifiers)
      })
      .traderReceipt();
    return traderReceipt;
  },
  brokerReceipt: async parent => {
    return await prisma.company
      .findUnique({
        where: whereSiretOrVatNumber(parent as CompanyBaseIdentifiers)
      })
      .brokerReceipt();
  },
  vhuAgrementBroyeur: parent => {
    return prisma.company
      .findUnique({
        where: whereSiretOrVatNumber(parent as CompanyBaseIdentifiers)
      })
      .vhuAgrementBroyeur();
  },
  vhuAgrementDemolisseur: parent => {
    return prisma.company
      .findUnique({
        where: whereSiretOrVatNumber(parent as CompanyBaseIdentifiers)
      })
      .vhuAgrementDemolisseur();
  }
};

export default companySearchResultResolvers;
