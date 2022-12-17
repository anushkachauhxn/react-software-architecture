# 🏙️ React: Software Architecture

## Server Side Rendering

We render the React app JSX to HTML on the server instead of the client's browser.

Command to run the server:

```
npx babel-node server.js
```

or

```
npx nodemon --exec npx babel-node server.js
```

#### Babel

We'll use babel to run our server and transpile code.

**.babelrc**

- _@babel/preset-env:_ standard prest for converting newer javascript syntax into older javascript syntax
- _@babel/preset-react:_ preset for transpiling the JSX into actual javascript code

## Data Loading

- When an api is used, the server renders the frontend except for the parts where we need to load data.

- The API gets called after the app has been loaded from server. **We want to avoid this second trip.**

- i.e. the server should load this data instead of the frontend.

### Creating an API 🔴

If we create an API route for loading data in the server, we will find that this data is loaded after the server has rendered the app.

```js
app.get("/api/articles", (req, res) => {
  ...

  res.json(loadedArticles);
});
```

### Preloading data into the window 🟡

- Send the data into the html window using `<script>` tags.

```js
app.get("/*", (req, res) => {
  ...

  res.send(
    data.replace(
      '<div id="root"></div>',
      `<script>window.preloadedArticles = ${JSON.stringify(loadedArticles)}</script><div id="root">${reactApp}</div>`
    ));
});
```
