import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import { AppProvider } from "./context/GlobalContext.jsx";
import { BrowserRouter } from "react-router-dom";

// General style
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
