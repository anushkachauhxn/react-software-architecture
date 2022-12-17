import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { ServerStyleSheet } from "styled-components";
import path from "path";
import fs from "fs";
import "isomorphic-fetch";
import App from "./src/App";
import { articles } from "./data/data";
import InitialDataContext from "./src/context/InitialDataContext";

global.window = {}; // to remove 'window does not exist' error

const app = express();

app.use(express.static("./build", { index: false }));

/* Data Loading */
app.get("/api/articles", (req, res) => {
  const loadedArticles = articles;
  res.json(loadedArticles);
});

/* Rendering app from server */
app.get("/*", async (req, res) => {
  const sheet = new ServerStyleSheet();

  const contextObj = {
    _isServerSide: true,
    _requests: [],
    _data: {},
  };

  // Render #1: get data requests, collect styles
  renderToString(
    sheet.collectStyles(
      <InitialDataContext.Provider value={contextObj}>
        <StaticRouter location={req.url}>
          <App />
        </StaticRouter>
      </InitialDataContext.Provider>
    )
  );

  // After 1st render is finished
  await Promise.all(contextObj._requests);
  contextObj._isServerSide = false;
  delete contextObj._requests;

  // Render #2
  const reactApp = renderToString(
    <InitialDataContext.Provider value={contextObj}>
      <StaticRouter location={req.url}>
        <App />
      </StaticRouter>
    </InitialDataContext.Provider>
  );

  const templateFile = path.resolve("./build/index.html");
  fs.readFile(templateFile, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }

    const loadedData = JSON.stringify(contextObj);
    res.send(
      data
        .replace(
          '<div id="root"></div>',
          `<script>window.preloadedData = ${loadedData}</script><div id="root">${reactApp}</div>`
        )
        .replace("{{ styles }}", sheet.getStyleTags())
    );
  });
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080.");
});
