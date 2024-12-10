import { useState, useEffect } from "react";
import axios from "axios";

export const useElasticsearch = (indexName = "product_sales") => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const elasticsearchAPI = axios.create({
    baseURL: "http://localhost:9200",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await elasticsearchAPI.post(`/${indexName}/_search`, {
        size: 100,
        sort: [{ timestamp: { order: "desc" } }],
        query: { match_all: {} },
      });

      const processedData = response.data.hits.hits.map((hit) => ({
        id: hit._id,
        ...hit._source,
      }));

      setData(processedData);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const searchData = async (query) => {
    try {
      setLoading(true);
      const response = await elasticsearchAPI.post(`/${indexName}/_search`, {
        query: {
          multi_match: {
            query: query,
            fields: ["name", "category"],
          },
        },
      });

      const processedData = response.data.hits.hits.map((hit) => ({
        id: hit._id,
        ...hit._source,
      }));

      setData(processedData);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [indexName]);

  return { data, loading, error, searchData, refetch: fetchData };
};
