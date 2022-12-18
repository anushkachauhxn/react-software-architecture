import React, { useState, lazy, Suspense } from "react";

const One = lazy(() => import("../components/One"));
const Two = lazy(() => import("../components/Two"));
const Three = lazy(() => import("../components/Three"));

const About = () => {
  const [showComponents, setShowComponents] = useState(false);

  return (
    <>
      <h1>About</h1>
      <button onClick={() => setShowComponents(!showComponents)}>
        Show / Hide
      </button>

      {showComponents && (
        <Suspense fallback={<p>Loading components...</p>}>
          <One />
          <Two />
          <Three />
        </Suspense>
      )}
    </>
  );
};

export default About;
