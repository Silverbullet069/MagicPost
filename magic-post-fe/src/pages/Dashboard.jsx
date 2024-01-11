import React, { useCallback, useEffect, useRef, useState } from "react";
import { redirect } from "react-router-dom";

// import components
import Navbar from "../components/general/Navbar";
import SeniorMng from "../components/content/roles/SeniorMng";
import ConsolMng from "../components/content/roles/ConsolMng";
import TradeMng from "../components/content/roles/TradeMng";
import ConsolEmp from "../components/content/roles/ConsolEmp";
import TradeEmp from "../components/content/roles/TradeEmp";

import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../context/GlobalContext";

const Dashboard = () => {
  const { user } = useGlobalContext();

  const goToLogin = useNavigate();

  useEffect(() => {
    if (!user) goToLogin("/");
  }, []);

  const checkRole = (role) => {
    return user && user["role"] === role;
  };

  return (
    <>
      <Navbar />
      {checkRole("senior_mng") && <SeniorMng />}
      {checkRole("tp_mng") && <TradeMng />}
      {checkRole("cp_mng") && <ConsolMng />}
      {checkRole("tp_emp") && <TradeEmp />}
      {checkRole("cp_mng") && <ConsolEmp />}
    </>
  );
};

export default Dashboard;
