import React from "react";
import { view } from "@risingstack/react-easy-state";
import titleStore from "./titleStore";

export default view(() => {
  const title = titleStore("App title");
  return <input value={title.value} onChange={title.onChange} />;
});
