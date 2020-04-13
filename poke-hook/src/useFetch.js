import { useState, useCallback } from "react";

export default function useFetch(baseURL) {
  const [state, setState] = useState({});

  const fetch = useCallback(
    async path => {
      setState(state => ({ ...state, loading: true }));
      try {
        const data = await fetchJSON(baseURL + path);
        setState(state => ({ ...state, data, error: undefined }));
      } catch (error) {
        setState(state => ({ ...state, error }));
      } finally {
        setState(state => ({ ...state, loading: false }));
      }
    },
    [baseURL]
  );

  return [state, fetch];
}

function fetchJSON(url) {
  return fetch(url).then(resp => resp.json());
}
