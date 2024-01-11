import React from "react";
import { Routes, Route } from "react-router-dom";

import Sidebar from "../Sidebar";
import Welcome from "../../general/Welcome";
import { TRADE_EMP_SIDEBAR_TREE } from "../../../data";

function TradeEmp() {
  return (
    <div className="dashboard-body">
      <Sidebar key="trade-emp-sidebar" props={TRADE_EMP_SIDEBAR_TREE} />
      <Routes>
        <Route index element={<Welcome key={"trade-mng-welcome"} />} />
      </Routes>
    </div>
  );
}

export default TradeEmp;
