import React, { useMemo } from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "../Sidebar";
import Welcome from "../../general/Welcome";
import List from "../List";
import Create from "../Create";
import Edit from "../Edit";

import {
  CONSOL_EMP_ACC_TEMPLATE,
  CONSOL_MNG_SIDEBAR_TREE,
  CONSOL_MNG_STATS_TEMPLATE,
} from "../../../data";
import StatisticsPointMng from "../StatisticsPointMng";
import { useGlobalContext } from "../../../context/GlobalContext";

function ConsolMng() {
  const { user } = useGlobalContext();

  const CONSOL_EMP_ACC_TEMPLATE_PROCESSED = useMemo(() => {
    return {
      ...CONSOL_EMP_ACC_TEMPLATE,
      list: CONSOL_EMP_ACC_TEMPLATE.list.replace(":id", user["id"]),
      create: CONSOL_EMP_ACC_TEMPLATE.create.replace(":id", user["id"]),
      edit: CONSOL_EMP_ACC_TEMPLATE.edit.replace(":id", user["id"]),
      delete: CONSOL_EMP_ACC_TEMPLATE.delete.replace(":id", user["id"]),
      stats: CONSOL_EMP_ACC_TEMPLATE.stats.replace(":id", user["id"]),
    };
  }, []);

  console.log(CONSOL_EMP_ACC_TEMPLATE_PROCESSED.stats);

  return (
    <div className="dashboard-body">
      <Sidebar key="consol-mng-sidebar" props={CONSOL_MNG_SIDEBAR_TREE} />

      <Routes>
        <Route index element={<Welcome key={"consol-mng-welcome"} />} />
        <Route
          path={CONSOL_EMP_ACC_TEMPLATE_PROCESSED.list}
          element={
            <List
              key="list-consol-emp-acc"
              {...CONSOL_EMP_ACC_TEMPLATE_PROCESSED}
            />
          }
        />
        <Route
          path={CONSOL_EMP_ACC_TEMPLATE_PROCESSED.create}
          element={
            <Create
              key="create-consol-emp-acc"
              {...CONSOL_EMP_ACC_TEMPLATE_PROCESSED}
            />
          }
        />
        <Route
          path={CONSOL_EMP_ACC_TEMPLATE_PROCESSED.edit}
          element={
            <Edit
              key="edit-consol-emp-acc"
              {...CONSOL_EMP_ACC_TEMPLATE_PROCESSED}
            />
          }
        />
        <Route
          path={CONSOL_EMP_ACC_TEMPLATE_PROCESSED.stats}
          element={
            <StatisticsPointMng
              key="stats-consol-mng"
              {...CONSOL_MNG_STATS_TEMPLATE}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default ConsolMng;
