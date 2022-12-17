import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { ServerStyleSheet } from "styled-components";
import path from "path";
import fs from "fs";
import App from "./src/App";
import { articles } from "./data/data";

global.window = {}; // to remove 'window does not exist' error

const app = express();

app.use(express.static("./build", { index: false }));

/* Data Loading */
app.get("/api/articles", (req, res) => {
  const loadedArticles = articles;
  res.json(loadedArticles);
});

/* Rendering app from server */
app.get("/*", (req, res) => {
  const sheet = new ServerStyleSheet();

  const reactApp = renderToString(
    sheet.collectStyles(
      <StaticRouter location={req.url}>
        <App />
      </StaticRouter>
    )
  );

  const templateFile = path.resolve("./build/index.html");
  fs.readFile(templateFile, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }

    const loadedArticles = articles;

    res.send(
      data
        .replace(
          '<div id="root"></div>',
          `<script>window.preloadedArticles = ${JSON.stringify(
            loadedArticles
          )}</script>
          <div id="root">${reactApp}</div>`
        )
        .replace("{{ styles }}", sheet.getStyleTags())
    );
  });
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080.");
});
