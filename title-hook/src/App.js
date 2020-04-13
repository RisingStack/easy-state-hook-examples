import React from "react";
import useTitle from "./useTitle";

export default () => {
  const [title, onChange] = useTitle("App title");
  return <input value={title} onChange={onChange} />;
};
