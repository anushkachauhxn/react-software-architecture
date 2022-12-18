import React from "react";
import useDataSSR from "../hooks/useDataSSR";

const Articles = () => {
  const articles = useDataSSR("articles", () => {
    console.log("No preloaded articles found, loading from server.");
    return fetch("http://localhost:8080/api/articles").then((res) =>
      res.json()
    );
  });

  return (
    <>
      <h1>Articles</h1>
      {articles &&
        articles.map((article) => (
          <div>
            <h3>{article.title}</h3>
            <h4>by {article.author}</h4>
            <p>{article.body}</p>
          </div>
        ))}
    </>
  );
};

export default Articles;
