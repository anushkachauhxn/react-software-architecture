import React from "react";
import styled from "styled-components";
import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Articles from "./pages/Articles";

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/articles" element={<Articles />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
