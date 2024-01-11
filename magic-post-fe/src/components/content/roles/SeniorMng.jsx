import React, { useState, useEffect } from "react";

import { Routes, Route } from "react-router-dom";

import Sidebar from "../Sidebar";

import Welcome from "../../general/Welcome";
import List from "../List";
import Create from "../Create";
import Edit from "../Edit";
// import Delete from "../content/Delete";
import StatisticsSeniorMng from "../StatisticsSeniorMng";

import { SENIOR_MANAGER_SIDEBAR_TREE } from "../../../data";
import { TRADE_POINT_TEMPLATE } from "../../../data";
import { CONSOL_POINT_TEMPLATE } from "../../../data";
import { TRADE_MNG_ACC_TEMPLATE } from "../../../data";
import { CONSOL_MNG_ACC_TEMPLATE } from "../../../data";
import { SENIOR_MNG_STATS_TEMPLATE } from "../../../data";

const SeniorMng = () => {
  // const [activeContent, setActiveContent] = useState({
  //   content: <Welcome className='sidebar-icon' />,
  //   btnName: "",
  // });

  return (
    <div className="dashboard-body">
      <Sidebar key="senior-mng-sidebar" props={SENIOR_MANAGER_SIDEBAR_TREE} />
      <Routes>
        <Route index element={<Welcome key="senior-mng-welcome" />} />

        {/* ************** MANAGE TRADING POINT ***************** */}

        <Route
          path={TRADE_POINT_TEMPLATE.list}
          element={<List key="list-trade-point" {...TRADE_POINT_TEMPLATE} />}
        />
        <Route
          path={TRADE_POINT_TEMPLATE.create}
          element={
            <Create key="create-trade-point" {...TRADE_POINT_TEMPLATE} />
          }
        />
        <Route
          path={TRADE_POINT_TEMPLATE.edit}
          element={<Edit key="edit-trade-point" {...TRADE_POINT_TEMPLATE} />}
        />

        {/* ************** MANAGE CONSOLIDATION POINT ***************** */}

        <Route
          path={CONSOL_POINT_TEMPLATE.list}
          element={<List key="list-consol-point" {...CONSOL_POINT_TEMPLATE} />}
        />

        <Route
          path={CONSOL_POINT_TEMPLATE.create}
          element={
            <Create key="create-consol-point" {...CONSOL_POINT_TEMPLATE} />
          }
        />

        <Route
          path={CONSOL_POINT_TEMPLATE.edit}
          element={<Edit key="edit-consol-point" {...CONSOL_POINT_TEMPLATE} />}
        />

        {/* <Route path="points/consols/delete" element={<Delete />} /> */}

        {/* ************** MANAGE SENIOR TRADE ACCOUNT ***************** */}

        <Route
          path={TRADE_MNG_ACC_TEMPLATE.list}
          element={
            <List key="list-trade-mng-acc" {...TRADE_MNG_ACC_TEMPLATE} />
          }
        />

        <Route
          path={TRADE_MNG_ACC_TEMPLATE.create}
          element={
            <Create key="create-trade-mng-acc" {...TRADE_MNG_ACC_TEMPLATE} />
          }
        />

        <Route
          path={TRADE_MNG_ACC_TEMPLATE.edit}
          element={
            <Edit key="edit-trade-mng-acc" {...TRADE_MNG_ACC_TEMPLATE} />
          }
        />
        {/* <Route path="accounts/trades/delete" element={<Delete />} /> */}

        {/* *********** MANAGE SENIOR CONSOLIDATION ACCOUNT ************** */}

        <Route
          path={CONSOL_MNG_ACC_TEMPLATE.list}
          element={
            <List key="list-consol-mng-acc" {...CONSOL_MNG_ACC_TEMPLATE} />
          }
        />
        <Route
          path={CONSOL_MNG_ACC_TEMPLATE.create}
          element={
            <Create key="create-consol-mng-acc" {...CONSOL_MNG_ACC_TEMPLATE} />
          }
        />
        <Route
          path={CONSOL_MNG_ACC_TEMPLATE.edit}
          element={
            <Edit key="edit-consol-mng-acc" {...CONSOL_MNG_ACC_TEMPLATE} />
          }
        />
        {/* <Route path="accounts/consols/delete" element={<Delete />} /> */}

        {/* ********************** MANAGE STATISTICS ********************** */}

        <Route
          path="points/statistics"
          element={
            <StatisticsSeniorMng
              key={"stats-senior-mng"}
              {...SENIOR_MNG_STATS_TEMPLATE}
            />
          }
        />
      </Routes>
    </div>

    // <div className="dashboard-body">
    //   <aside className="dashboard-sidebar">

    //     <ul>
    //       {data.map((button) => (
    //         <li key={button.id}>
    //           <button
    //             className={
    //               activeContent.btnName === button.name
    //                 ? "dashboard-sidebar-btn active"
    //                 : "dashboard-sidebar-btn"
    //             }
    //             onClick={() => {
    //               const content =
    //                 button.content === activeContent.content ? (
    //                   <Welcome />
    //                 ) : (
    //                   button.content
    //                 );

    //               const btnName =
    //                 button.name === activeContent.btnName ? "" : button.name;

    //               setActiveContent({
    //                 content,
    //                 btnName,
    //               });
    //             }}
    //           >
    //             {button.icon}
    //             {button.name}
    //           </button>
    //         </li>
    //       ))}
    //     </ul>
    //   </aside>

    //   <div className="dashboard-content">{activeContent.content}</div>
    // </div>
  );
};

export default SeniorMng;
