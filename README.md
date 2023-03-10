# 🚁 React: Software Architecture

# 1️⃣ Server Side Rendering

We render the React app JSX to HTML on the server instead of the client's browser.

```js
const app = express();

app.use(express.static("./build", { index: false }));

app.get("/*", async (req, res) => {
  const reactApp = renderToString(
    <StaticRouter location={req.url}>
      <App />
    </StaticRouter>
  );

  const templateFile = path.resolve("./build/index.html");
  fs.readFile(templateFile, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.send(
      data.replace('<div id="root"></div>', `<div id="root">${reactApp}</div>`)
    );
  });
});
```

#### Command to run the server:

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

<hr><br>

# 2️⃣ Data Loading

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
    ... <App /> ...
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
renderToString(
  <InitialDataContext.Provider value={contextObj}>
    ... <App /> ...
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

_Let's cover all cases._

<details>
<summary>CASE 1: Render #2 + Data is available</summary>
<br>
Data gets loaded from the context `_data` and is returned to the component calling it.

```js
const [data, setData] = useState(context._data[resourceName]);
```

</details>

<details>
<summary>CASE 2: Render #1</summary>
<br>
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

</details>

<details>
<summary>CASE 3: Render #2 + Data is not available</summary>
<br>
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

</details>

### Using custom hook: `useDataSSR()`

_In Articles.js_

```js
const articles = useDataSSR("articles", () => {
  console.log("No preloaded articles found, loading from server.");
  return fetch("http://localhost:8080/api/articles").then((res) => res.json());
});
```

**_Note:_**

- Since the server side has to render the frontend, we need `fetch` to work on the server. It only exists by default in the browser.
- This is why we import an implementation of fetch in our backend.

```
npm install isomorphic-fetch
import "isomorphic-fetch";
```

- We need the complete server URL for this: `http://localhost:8080/api/articles`

<hr><br>

# 3️⃣ Code Splitting

- Instead of delivering all React code to the client at once, we deliver it in pieces as needed.
- This maximizes performance by letting us reduce the amount of code that the client side has to load on the first render.

### How to go about it?

1. Create `lazy` components:

```js
const One = lazy(() => import("../components/One"));
const Two = lazy(() => import("../components/Two"));
const Three = lazy(() => import("../components/Three"));
```

_Note:_ Here, the components have to be exported by default for the import statements to work.

2. Rendering them with `Suspense`:

```js
<Suspense fallback={<p>Loading components...</p>}>
  <One />
  <Two />
  <Three />
</Suspense>
```

### When to use code splitting?

- Whenever there is a large portion of the code that users will not be seeing in one go.
- Generally, splitting is based on the pages/ components that the users view together.
- For example: Route pages, components that appear on a button click.

### Error Boundaries

- Lazy loading introduces new error possibilities for our application.
- We are relying on the network to load our components. So, if we have a network problem, our components could run into errors and our application could crash.

- Error Boundaries are basically components that block off sections of the user interface that we expect may cause some kind of error.

```js
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }
  componentDidCatch(error, errorInfo) {
    console.log({ error, errorInfo });
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <p>Uh Oh! Something went wrong.</p>;
    }
    return this.props.children;
  }
}
```

```js
<Suspense fallback={<p>Loading components...</p>}>
  <ErrorBoundary>
    <One />
  </ErrorBoundary>
  ...
</Suspense>
```

If your app is crashing because of the error, you'll need production build.

```
npm run build
npm install -g serve
serve -s build
```

<hr><br>

# 4️⃣ Code Organisation

### Function vs Feature Based Organisation

- **Function Based:** The highest level folders in the src directory are based on the functions they provide.

```
src
└───hooks
└───network
└───pages
└───reducers
└───util
```

- **Feature Based:** The highest level folders in the src directory are based on the features they are used in.
- This works better for large scale applications where different developers work on different features.

```
src
└───articles
└───sign-ups
└───subscriptions
```

## Monoliths, Multi-repos and Monorepos

#### Monoliths:

- All the project code is included in a single codebase.
- It generally has to be modified and deployed all at once.

<br>

- Simple at first. Usually the default.
- Can become unmanageable very quickly.
- Ideal for very small teams working on short-term projects.

#### Multi-repos:

- The project code is separated into multiple codebases.
- Each codebase can be worked on and deployed _independently_.

<br>

- Add some overhead for setup.
- Make the deployment process more complex.
- Allo independent versioning of different parts.
- Generally better for companies with fairly isolated teams.

#### Monorepos:

- Mix of both.
- Single codebase + Organised such that each piece is largely independent.

<br>

- Many same benefits as multi-repos, except code is technically in the same repo.
- Used by large tech companies, including Google, Microsoft, Twitter.

<hr><br>

### ☑️ References:

- LinkedIn Learning Course - [Link](https://www.linkedin.com/learning/react-software-architecture)
