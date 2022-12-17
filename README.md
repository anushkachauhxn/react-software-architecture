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

# Data Loading

- When an api is used, the server renders the frontend except for the parts where we need to load data.

- The API gets called after the app has been loaded from server. **We want to avoid this second trip.**

- i.e. the server should load this data instead of the frontend.

## Creating an API 🔴

If we create an API route for loading data in the server, we will find that this data is loaded after the server has rendered the app.

```js
app.get("/api/articles", (req, res) => {
  ...

  res.json(loadedArticles);
});
```

## Preloading data into the window 🟡

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

## Using Context 🟢

- To load the data _into the app body_ from the server-side, we need to use **context** to communicate between the frontend and the backend.
- This is because the `useEffect` hook will not be called when the components are being rendered on the server side.

#### What will we do?

Render our app on the server side **twice**:

1. _First Render:_ We'll find what components need to load their data on the server side.
2. _Second Render:_ And then, load that data on our server and pass it back through the context provider.

### Context Provider and `contextObj`

- Create an object `contextObj` and pass it to frontend through `Context.Provider`.

```js
const contextObj = {
  _isServerSide: true, // frontend will check: If true, they will push their data requests in `_requests`
  _requests: [], // get data requests from frontend on first render
  _data: {}, // will contain the requested data
};
```

```js
renderToString(
  <InitialDataContext.Provider value={contextObj}>
    <StaticRouter location={req.url}>
      <App />
    </StaticRouter>
  </InitialDataContext.Provider>
);
```

- After the first render, we resolve all requests and get ready for final render.

```js
await Promise.all(contextObj._requests);
contextObj._isServerSide = false;
delete contextObj._requests;
```

```js
const reactApp = renderToString(
  <InitialDataContext.Provider value={contextObj}>
    <StaticRouter location={req.url}>
      <App />
    </StaticRouter>
  </InitialDataContext.Provider>
);
```

### Creating custom hook: `useDataSSR()`

- Create a custom hook for fetching data on the frontend side.

```js
const useDataSSR = (resourceName, loadFunc) => {
  const context = useContext(InitialDataContext);
  const [data, setData] = useState(context._data[resourceName]); // CASE 1

  if (context._isServerSide) {
    // CASE 2
    context._requests.push(
      loadFunc().then((result) => {
        context._data[resourceName] = result;
      })
    );
  } else if (!data) {
    // CASE 3
    loadFunc().then((result) => {
      setData(result);
      context._data[resourceName] = result;
    });
  }

  return data;
};
```

Let's cover all cases.

#### CASE 1: 2nd Render + Data is available

Data gets loaded from the context `_data` and is returned to the component calling it.

```js
const [data, setData] = useState(context._data[resourceName]);
```

#### CASE 2: 1st Render

- We push the load function to `_requests`.
- Add a `.then()` function to make sure that the result is stored in `_data` when the load function is executed.

```js
if (context._isServerSide) {
  context._requests.push(
    loadFunc().then((result) => {
      context._data[resourceName] = result;
    })
  );
}
```

#### CASE 3: 2nd Render + Data is not available

- We execute the load function and return result as data.
- We also store the result in `_data` to make it available for later.

```js
else if (!data) {
  loadFunc().then((result) => {
    setData(result);
    context._data[resourceName] = result;
  });
}
```

### Using custom hook: `useDataSSR()`

_Articles.js_

```js
const articles = useDataSSR("articles", () => {
  console.log("No preloaded articles found, loading from server.");

  return fetch("http://localhost:8080/api/articles").then((res) => res.json());
});
```

**_Note:_**

- Since the server side has to render the frontend, we need `fetch` to work on the server.
- It only exists by default in the browser.

- This is why we import an implementation of fetch in our backend: **isomorphic-fetch**.
- We need the complete server URL for this: `http://localhost:8080/api/articles`

```
npm install isomorphic-fetch
```

```js
import "isomorphic-fetch";
```
