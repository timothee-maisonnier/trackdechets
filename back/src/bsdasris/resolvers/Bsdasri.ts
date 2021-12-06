import { BsdasriResolvers } from "../../generated/graphql/types";

import grouping from "./bsdasris/grouping";
import groupedIn from "./bsdasris/groupedIn";
import synthesizing from "./bsdasris/synthesizing";
import synthesizedIn from "./bsdasris/synthesizedIn";

const bsdasriResolvers: BsdasriResolvers = {
  grouping,
  groupedIn,
  synthesizing,
  synthesizedIn,
  metadata: bsdasri => {
    return {
      id: bsdasri.id
    } as any;
  }
};

export default bsdasriResolvers;
