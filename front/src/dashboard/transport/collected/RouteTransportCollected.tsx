import * as React from "react";
import { useParams } from "react-router-dom";
import {
  Blankslate,
  BlankslateDescription,
  BlankslateImg,
  BlankslateTitle,
  Breadcrumb,
  BreadcrumbItem,
} from "common/components";

import { BSDList } from "../../components/BSDList/BSDList";
import { BSD_COLUMNS } from "../../components/BSDList/columns";
import illustration from "./assets/blankslateCollected.svg";

const COLLECTED_COLUMNS = [
  BSD_COLUMNS.type,
  BSD_COLUMNS.readableId,
  BSD_COLUMNS.emitter,
  BSD_COLUMNS.recipient,
  BSD_COLUMNS.waste,
  BSD_COLUMNS.transporterCustomInfo,
  BSD_COLUMNS.transporterNumberPlate,
  BSD_COLUMNS.status,
];

export function RouteTransportCollected() {
  const { siret } = useParams<{ siret: string }>();
  const defaultWhere = React.useMemo(
    () => ({
      isCollectedFor: [siret],
    }),
    [siret]
  );

  return (
    <>
      <Breadcrumb>
        <BreadcrumbItem>Transport</BreadcrumbItem>
        <BreadcrumbItem>
          Chargés, en attente de réception ou de transfert
        </BreadcrumbItem>
      </Breadcrumb>

      <BSDList
        siret={siret}
        defaultWhere={defaultWhere}
        columns={COLLECTED_COLUMNS}
        blankslate={
          <Blankslate>
            <BlankslateImg src={illustration} alt="" />
            <BlankslateTitle>Il n'y a aucun bordereau collecté</BlankslateTitle>
            <BlankslateDescription>
              Des bordereaux apparaissent dans cet onglet lorsqu'ils sont en
              cours de transport par votre entreprise.
            </BlankslateDescription>
          </Blankslate>
        }
      />
    </>
  );
}
