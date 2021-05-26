import {
  MutationResolvers,
  QueryResolvers
} from "../../generated/graphql/types";

import bsda from "./queries/bsda";
import bsdas from "./queries/bsdas";
import createBsda from "./mutations/create";
import createDraftBsda from "./mutations/createDraft";
import updateBsda from "./mutations/update";
import signBsda from "./mutations/sign";
import duplicateBsda from "./mutations/duplicate";
import publishBsda from "./mutations/publish";

const Query: QueryResolvers = {
  bsda,
  bsdas
};
const Mutation: MutationResolvers = {
  createBsda,
  createDraftBsda,
  updateBsda,
  signBsda,
  duplicateBsda,
  publishBsda
};

export default { Query, Mutation };
