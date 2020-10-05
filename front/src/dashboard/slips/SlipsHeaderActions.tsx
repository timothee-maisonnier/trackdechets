import React from "react";
import { Link } from "react-router-dom";
import { RefreshIcon } from "src/common/components/Icons";
import styles from "./SlipsHeaderActions.module.scss";

export default function SlipsHeaderActions({ refetch }) {
  return (
    <div className={styles.slipHeaderActions}>
      <Link to="/form" className="btn btn--primary">
        Créer un bordereau…
      </Link>
      <button
        className={`btn btn--primary ${styles.refreshButton}`}
        onClick={() => refetch()}
      >
        <span>Rafraîchir</span><RefreshIcon />
      </button>
    </div>
  );
}
