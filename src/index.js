import React from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import InitialDataContext from "./context/InitialDataContext";
import App from "./App";

const root = hydrateRoot(
  document.getElementById("root"),
  <React.StrictMode>
    <InitialDataContext.Provider
      value={(window && window.preloadedData) || { _data: {} }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </InitialDataContext.Provider>
  </React.StrictMode>
);
