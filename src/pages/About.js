import React, { lazy, Suspense } from "react";

const One = lazy(() => import("../components/One"));
const Two = lazy(() => import("../components/Two"));
const Three = lazy(() => import("../components/Three"));

const About = () => {
  return (
    <>
      <h1>About</h1>
      <Suspense fallback={<p>Loading components...</p>}>
        <One />
        <Two />
        <Three />
      </Suspense>
    </>
  );
};

export default About;
