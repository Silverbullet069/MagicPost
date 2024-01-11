import React, { useMemo } from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "../Sidebar";
import Welcome from "../../general/Welcome";
import List from "../List";
import Create from "../Create";
import Edit from "../Edit";

import {
  TRADE_EMP_ACC_TEMPLATE,
  TRADE_MNG_SIDEBAR_TREE,
  TRADE_MNG_STATS_TEMPLATE,
} from "../../../data";
import StatisticsPointMng from "../StatisticsPointMng";
import { useGlobalContext } from "../../../context/GlobalContext";

function TradeMng() {
  const { user } = useGlobalContext();

  const TRADE_EMP_ACC_TEMPLATE_PROCESSED = useMemo(() => {
    return {
      ...TRADE_EMP_ACC_TEMPLATE,
      list: TRADE_EMP_ACC_TEMPLATE.list.replace(":id", user["id"]),
      create: TRADE_EMP_ACC_TEMPLATE.create.replace(":id", user["id"]),
      edit: TRADE_EMP_ACC_TEMPLATE.edit.replace(":id", user["id"]),
      delete: TRADE_EMP_ACC_TEMPLATE.delete.replace(":id", user["id"]),
      stats: TRADE_EMP_ACC_TEMPLATE.stats.replace(":id", user["id"]),
    };
  }, []);

  // console.log(TRADE_EMP_ACC_TEMPLATE_PROCESSED);

  return (
    <div className="dashboard-body">
      <Sidebar key="trade-mng-sidebar" props={TRADE_MNG_SIDEBAR_TREE} />

      <Routes>
        <Route index element={<Welcome key={"trade-mng-welcome"} />} />
        <Route
          path={TRADE_EMP_ACC_TEMPLATE_PROCESSED.list}
          element={
            <List
              key="list-trade-emp-acc"
              {...TRADE_EMP_ACC_TEMPLATE_PROCESSED}
            />
          }
        />
        <Route
          path={TRADE_EMP_ACC_TEMPLATE_PROCESSED.create}
          element={
            <Create
              key="create-trade-emp-acc"
              {...TRADE_EMP_ACC_TEMPLATE_PROCESSED}
            />
          }
        />
        <Route
          path={TRADE_EMP_ACC_TEMPLATE_PROCESSED.edit}
          element={
            <Edit
              key="edit-trade-emp-acc"
              {...TRADE_EMP_ACC_TEMPLATE_PROCESSED}
            />
          }
        />
        <Route
          path={TRADE_EMP_ACC_TEMPLATE_PROCESSED.stats}
          element={
            <StatisticsPointMng
              key="stats-trade-mng"
              {...TRADE_MNG_STATS_TEMPLATE}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default TradeMng;
