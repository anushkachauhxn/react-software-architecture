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
