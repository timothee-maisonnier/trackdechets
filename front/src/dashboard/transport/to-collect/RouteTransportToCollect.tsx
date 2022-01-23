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
import illustration from "./assets/blankslateToCollect.svg";

const TO_COLLECT_COLUMNS = [
  BSD_COLUMNS.type,
  BSD_COLUMNS.readableId,
  BSD_COLUMNS.emitter,
  BSD_COLUMNS.recipient,
  BSD_COLUMNS.waste,
  BSD_COLUMNS.transporterCustomInfo,
  BSD_COLUMNS.transporterNumberPlate,
  BSD_COLUMNS.status,
];

export function RouteTransportToCollect() {
  const { siret } = useParams<{ siret: string }>();
  const defaultWhere = React.useMemo(
    () => ({
      isToCollectFor: [siret],
    }),
    [siret]
  );

  return (
    <>
      <Breadcrumb>
        <BreadcrumbItem>Transport</BreadcrumbItem>
        <BreadcrumbItem>À collecter</BreadcrumbItem>
      </Breadcrumb>

      <BSDList
        siret={siret}
        defaultWhere={defaultWhere}
        columns={TO_COLLECT_COLUMNS}
        blankslate={
          <Blankslate>
            <BlankslateImg src={illustration} alt="" />
            <BlankslateTitle>
              Il n'y a aucun bordereau à collecter
            </BlankslateTitle>
            <BlankslateDescription>
              Des bordereaux apparaissent dans cet onglet lorsqu'ils sont en
              attente de collecte par votre entreprise.
            </BlankslateDescription>
          </Blankslate>
        }
      />
    </>
  );
}
