import React, { useEffect, useState } from "react";

const Articles = () => {
  const [articles, setArticles] = useState();

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => setArticles(data));
  }, []);

  return (
    <div>
      <h1>Articles</h1>
      {articles &&
        articles.map((article) => (
          <div>
            <h3>{article.title}</h3>
            <h4>by {article.author}</h4>
            <p>{article.body}</p>
          </div>
        ))}
    </div>
  );
};

export default Articles;
