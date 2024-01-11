import { useState } from "react"; // new React version don't need to import React
import { Routes, Route } from "react-router-dom";

// import pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Client from "./pages/Client";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/client" element={<Client />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </>
  );
};

export default App;
