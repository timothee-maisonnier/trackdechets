import { FieldProps } from "formik";
import React, { useState } from "react";
import { WASTES } from "generated/constants";
import RedErrorMessage from "common/components/RedErrorMessage";
import WasteTreeModal from "search/WasteTreeModal";
import styles from "./WasteCode.module.scss";

function formatWasteCode(wasteCode: string) {
  if (!wasteCode) {
    return wasteCode;
  }
  const trimmed = wasteCode.trim();
  const stringLength = trimmed.length;
  if (
    [3, 6].indexOf(stringLength) > -1 &&
    wasteCode[stringLength - 1] !== " "
  ) {
    return `${wasteCode.substr(0, stringLength - 1)} ${wasteCode.substr(
      stringLength - 1,
      1
    )}`;
  }
  return trimmed;
}

export function WasteCodeSelect({ field, form }: FieldProps) {
  const [openModal, setOpenModal] = useState(false);

  const waste = WASTES.find(waste => waste.code === field.value);

  return (
    <div>
      <div className={styles.textQuote}>
        <ul>
          <li>
            Vous hésitez sur le type de code déchet à choisir ? Sélectionnez un
            code via le bouton de liste des codes déchets
            <WasteTreeModal
              open={openModal}
              onClose={() => setOpenModal(false)}
              onSelect={codes => {
                form.setFieldValue(field.name, codes[0]);
              }}
            />
          </li>
          <li>Pour les codes déchets dangereux n'oubliez pas l'astérisque</li>
        </ul>
      </div>

      <label>
        Code déchet
        <div className={styles.wasteCodeWidgets}>
          <input
            {...field}
            type="text"
            className={`td-input ${styles.wasteCodeInput}`}
            onChange={e => {
              e.target.value = formatWasteCode(e.target.value);
              field.onChange(e);
            }}
          />
          <button
            type="button"
            className="btn btn--outline-primary"
            onClick={() => setOpenModal(true)}
          >
            Liste des codes déchets
          </button>
        </div>
      </label>

      <RedErrorMessage name={field.name} />

      {field.value && (
        <div className="notification success tw-mt-2">
          Vous avez sélectionné le code déchet suivant:{" "}
          <em>{waste?.description}</em>
        </div>
      )}
    </div>
  );
}
