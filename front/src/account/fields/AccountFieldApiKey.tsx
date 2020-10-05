import React, { useState } from "react";
import { useLazyQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import ToolTip from "src/common/components/Tooltip";
import AccountFormApiKey from "./forms/AccountFormApiKey";
import styles from "./AccountField.module.scss";

const GET_API_KEY = gql`
  query ApiKey {
    apiKey
  }
`;

export default function AccountFieldApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [getApiKey] = useLazyQuery(GET_API_KEY, {
    onCompleted: data => {
      if (data && data.apiKey) {
        setApiKey(data.apiKey);
      }
    },
    fetchPolicy: "no-cache",
  });

  const tootlTip =
    "Cette clé peut-être utilisée pour s'authentifier à l'API Trackdéchets";

  return (
    <div className={styles.field}>
      <label>
        Clé d'API <ToolTip msg={tootlTip} />
      </label>
      {apiKey ? (
        <AccountFormApiKey apiKey={apiKey} />
      ) : (
        <span>********************</span>
      )}

      {!apiKey ? (
        <div className={styles.modifier} onClick={() => getApiKey()}>
          Générer une clé
        </div>
      ) : (
        <div className={styles.modifier} onClick={() => setApiKey(null)}>
          Annuler
        </div>
      )}
    </div>
  );
}
