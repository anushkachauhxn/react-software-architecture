import React, { lazy, Suspense } from "react";
import styled from "styled-components";
import { Link, Route, Routes } from "react-router-dom";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Articles = lazy(() => import("./pages/Articles"));

const BigHeading = styled.h1`
  font-size: 64px;
`;

const App = () => {
  return (
    <div className="app">
      <BigHeading>SSR Example</BigHeading>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/articles">Articles</Link>
          </li>
        </ul>
      </nav>
      <main>
        <Suspense fallback={<p>Loading...</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/articles" element={<Articles />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
