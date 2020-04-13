import React from "react";
import { view, store, autoEffect } from "@risingstack/react-easy-state";

export default view(() => {
  const title = store({
    value: "App title",
    onChange: ev => (title.value = ev.target.value)
  });
  autoEffect(() => (document.title = title.value));

  return <input value={title.value} onChange={title.onChange} />;
});
