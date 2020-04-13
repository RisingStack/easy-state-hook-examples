# Reinventing hooks with React Easy State

Although I use React hooks a lot, I don't really like them. They are solving though problems but with an alien API that's hard to manage at scale.

It's even harder to wire them together with a library that is based on mutable data. The two concepts don't play well together and forcing them would cause a hot mess. Instead, the React Easy State team at RisingStack is working on alternative patterns that combine the core values of hooks and mutable data.

We think these core values are:

- encapsulation of pure logic
- reusability
- and composability.

At the same time we are trying to get rid of:

- the strange API
- reliance on closures to store data
- and overused patterns.

This article guides you through these points and how React Easy State tackles them compared to vanilla hooks.

## A basic example

Let's see how the same document title setting application can be written with hooks and with React Easy State.

### Hooks version

```jsx
import React, { useState, useCallback, useEffect } from "react";

export default () => {
  const [title, setTitle] = useState("App title");
  const onChange = useCallback(ev => setTitle(ev.target.value), [setTitle]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return <input value={title} onChange={onChange} />;
};
```

> [CodeSandbox demo](https://codesandbox.io/s/github/RisingStack/easy-state-hook-examples/tree/master/hook-app)

### React Easy State version

```jsx
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
```

> [CodeSandbox demo](https://codesandbox.io/s/github/RisingStack/easy-state-hook-examples/tree/master/store-app)

`autoEffect` replaces the `useEffect` hook while `store` replaces `useState`, `useCallback`, `useMemo` and others. Under the hood they are built on top of React hooks but they utilize a significantly different API and mindset.

## Reusability

What if you really love setting the document's title? Having to repeat the same code every time would disappointing. Luckily hooks were designed to capture reusable logic.

### Hooks version

_useTitle.js_

```js
import { useState, useCallback, useEffect } from "react";

export default function useTitle(initalTitle) {
  const [title, setTitle] = useState(initalTitle);
  const onChange = useCallback(ev => setTitle(ev.target.value), [setTitle]);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return [title, onChange];
}
```

_App.js_

```jsx
import React from "react";
import useTitle from "./useTitle";

export default () => {
  const [title, onChange] = useTitle();
  return <input value={title} onChange={onChange} />;
};
```

> [CodeSandbox demo](https://codesandbox.io/s/github/RisingStack/easy-state-hook-examples/tree/master/title-hook)

### React Easy State version

React Easy State tackles the same problem with **store factories**: a store factory is a function that returns a store. There are no other rules, you can use `store` and `autoEffect` - among other things - inside it.

_titleStore.js_

```js
import { store, autoEffect } from "@risingstack/react-easy-state";

export default function titleStore(initalTitle) {
  const title = store({
    value: initalTitle,
    onChange: ev => (title.value = ev.target.value)
  });

  autoEffect(() => (document.title = title.value));

  return title;
}
```

_App.js_

```jsx
import React from "react";
import { view } from "@risingstack/react-easy-state";
import titleStore from "./titleStore";

export default view(() => {
  const title = titleStore("App title");
  return <input value={title.value} onChange={title.onChange} />;
});
```

> [CodeSandbox demo](https://codesandbox.io/s/github/RisingStack/easy-state-hook-examples/tree/master/title-store)

## Closures and dependency arrays

Things can get messy as complexity grows, especially when async code gets involved. Let's write some reusable data fetching logic, maybe we will need it later (;

### Hooks version

_useFetch.js_

```js
import { useState, useCallback } from "react";

export default function useFetch(baseURL) {
  const [state, setState] = useState({});

  const fetch = useCallback(
    async path => {
      setState({ loading: true });
      try {
        const data = await fetchJSON(baseURL + path);
        setState({ ...state, data, error: undefined });
      } catch (error) {
        setState({ ...state, error });
      } finally {
        setState(state => ({ ...state, loading: false }));
      }
    },
    [baseURL, state]
  );

  return [state, fetch];
}
```

_App.js_

```jsx
import React from "react";
import useFetch from "./useFetch";

const POKE_API = "https://pokeapi.co/api/v2/pokemon/";

export default () => {
  const [{ data, error, loading }, fetch] = useFetch(POKE_API);

  return (
    <>
      <button onClick={() => fetch("ditto")}>Fetch pokemon</button>
      <div>
        {loading ? "Loading ..." : error ? "Error!" : JSON.stringify(data)}
      </div>
    </>
  );
};
```

> [CodeSandbox demo](https://codesandbox.io/s/github/RisingStack/easy-state-hook-examples/tree/master/fetch-hook)

Notice how we have to use a `setState` with an updater function in the `finally` block of `useFetch`. Do you know why does it need special handling?

- If not, try to rewrite it to `setState({ ...state, loading: false })` in the [CodeSandbox demo](https://codesandbox.io/s/github/RisingStack/easy-state-hook-examples/tree/master/fetch-hook) and see what happens. Then read [this article](https://dmitripavlutin.com/react-hooks-stale-closures/) to gain a deeper understanding of hooks and stale closures. Seriously, do these before you go on!

- Otherwise try to think of a good reason why the other `setState`s should be rewritten to use updater functions. (Keep reading for the answer.)

### React Easy State version

Probably you have heard that mutable data is bad (like a 1000 times) over your career. Well... closures are worse.

Hooks are heavily relying on closures to store data which leads to issues like the above example. Obviously this is not a bug in the hooks API, but it is a serious cognitive overhead that gets mind-bending as your complexity grows.

React Easy State is storing its data in mutable objects instead, which has its own quirks but it is way easier to handle in practice. You will always get what you ask for and not some stale data from a long-gone render.

_fetchStore.js_

```js
import { store } from "@risingstack/react-easy-state";

export default function fetchStore(baseURL) {
  const resource = store({
    async fetch(path) {
      resource.loading = true;
      try {
        resource.data = await fetchJSON(baseURL + path);
        resource.error = undefined;
      } catch (error) {
        resource.error = error;
      } finally {
        resource.loading = false;
      }
    }
  });

  return resource;
}
```

_App.js_

```jsx
import React from "react";
import { view } from "@risingstack/react-easy-state";
import fetchStore from "./fetchStore";

const POKE_API = "https://pokeapi.co/api/v2/pokemon/";

export default view(() => {
  const { loading, data, error, fetch } = fetchStore(POKE_API);

  return (
    <>
      <button onClick={() => fetch("ditto")}>Fetch pokemon</button>
      <div>
        {loading ? "Loading ..." : error ? "Error!" : JSON.stringify(data)}
      </div>
    </>
  );
});
```

> [CodeSandbox demo](https://codesandbox.io/s/github/RisingStack/easy-state-hook-examples/tree/master/fetch-store)

## Composability

While we played with fetching data the document title setting application turned into a massive hit with tons of feature requests. Eventually you end up fetching related pokemons from the [free pokeAPI](https://pokeapi.co/). Luckily you already have a data fetching hook, what a coincidence...

You don't want to refactor your existing code snippets, it would be nicer to **compose** them together into more complex units. The hooks API was designed to handle this.

### Hooks version

_usePokemon.js_

```js
import { useEffect } from "react";
import useTitle from "./useTitle";
import useFetch from "./useFetch";

const POKE_API = "https://pokeapi.co/api/v2/pokemon/";

export default function usePokemon(initialName) {
  const [name, onNameChange] = useTitle(initialName);
  const [data, fetch] = useFetch(POKE_API);

  useEffect(() => {
    fetch(name);
  }, [fetch, name]);

  return { ...data, name, onNameChange };
}
```

_App.js_

```jsx
import React from "react";
import usePokemon from "./usePokemon";

export default () => {
  const pokemon = usePokemon("ditto");

  return (
    <>
      <input value={pokemon.name} onChange={pokemon.onNameChange} />
      <div>
        {pokemon.loading
          ? "Loading ..."
          : pokemon.error
          ? "Error!"
          : JSON.stringify(pokemon.data)}
      </div>
    </>
  );
};
```

> [CodeSandbox demo](https://codesandbox.io/s/github/RisingStack/easy-state-hook-examples/tree/master/poke-hook)

This example has a serious but hard to grasp flaw - an infinite loop - caused by the long-forgotten `useFetch` hook.

> Otherwise try to think of a good reason why the other `setState`s should be rewritten to use updater functions. (Keep reading for the answer.)
>
> -- <cite>Me, a paragraph ago</cite>

So you kept reading and it's finally answer time! Let's take a closer look at `useFetch` again.

A _useFetch.js_ part

```js
const [state, setState] = useState({});

const fetch = useCallback(
  async path => {
    setState({ loading: true });
    try {
      const data = await fetchJSON(baseURL + path);
      setState({ ...state, data, error: undefined });
    } catch (error) {
      setState({ ...state, error });
    } finally {
      setState(state => ({ ...state, loading: false }));
    }
  },
  [baseURL, state]
);
```

The `fetch` callback uses `state` and has it inside its dependency array. This means that whenever `state` changes `fetch` gets recreated, and whenever `fetch` gets recreated our `useEffect` in `usePokemon` kicks in ...

```js
useEffect(() => {
  fetch(name);
}, [fetch, name]);
```

That's bad news, we only want to refetch the pokemon when `name` changes. It's time to remove `fetch` from the dependency array.

And it breaks again... This time it is not looping but it always fetches the first (stale) pokemon. We keep using an old fetch that is stuck with a stale closure as its data source.

The correct solution is to modify our `useFetch` hook to use function `setState`s inside the `fetch` callback and remove the `state` dependency from its dependency array.

This mess is caused by the combination of closures and hook dependency arrays. Let's avoids both of them.

### React Easy State version

React Easy State takes a different approach for composability. Stores are simple objects which can be combined by nesting them in other objects.

_pokeStore.js_

```js
import { store, autoEffect } from "@risingstack/react-easy-state";
import titleStore from "./titleStore";
import fetchStore from "./fetchStore";

const POKE_API = "https://pokeapi.co/api/v2/pokemon/";

export default function pokeStore(initialName) {
  const pokemon = store({
    name: titleStore(initialName),
    data: fetchStore(POKE_API)
  });

  autoEffect(() => pokemon.data.fetch(pokemon.name.value));

  return pokemon;
}
```

_App.js_

```jsx
import React from "react";
import { view } from "@risingstack/react-easy-state";
import pokeStore from "./pokeStore";

export default view(() => {
  const pokemon = pokeStore("ditto");

  return (
    <>
      <input value={pokemon.name.value} onChange={pokemon.name.onChange} />
      <div>
        {pokemon.data.loading
          ? "Loading ..."
          : pokemon.data.error
          ? "Error!"
          : JSON.stringify(pokemon.data.data)}
      </div>
    </>
  );
});
```

> [CodeSandbox demo](https://codesandbox.io/s/github/RisingStack/easy-state-hook-examples/tree/master/poke-store)

The data is stored in - always fresh - mutable objects and hook-like dependency arrays are not required because of the underlying transparent reactivity. Our original `fetchStore` works without any modification.

## Bonus points

React Easy State is a state management library, not a hook alternative. It provides some features that hooks can not.

### Global state

You can turn any local state into a global one by moving it outside of component scope. Global state can be shared between components regardless of their relative position to each other.

_pokemon.js_

```js
import pokeStore from "./pokeStore";

// this global state can be used by any component
export default pokeStore("ditto");
```

_Input.js_

```jsx
import React from "react";
import { view } from "@risingstack/react-easy-state";
import pokemon from "./pokemon";

export default view(() => (
  <input value={pokemon.name.value} onChange={pokemon.name.onChange} />
));
```

_Display.js_

```jsx
import React from "react";
import { view } from "@risingstack/react-easy-state";
import pokemon from "./pokemon";

export default view(() => (
  <div>
    {pokemon.data.loading
      ? "Loading ..."
      : pokemon.data.error
      ? "Error!"
      : JSON.stringify(pokemon.data.data)}
  </div>
));
```

_App.js_

```jsx
import React from "react";
import { view } from "@risingstack/react-easy-state";
import Input from "./Input";
import Display from "./Display";

export default view(() => (
  <>
    <Input />
    <Display />
  </>
));
```

> [CodeSandbox demo](https://codesandbox.io/s/github/RisingStack/easy-state-hook-examples/tree/master/poke-store-global)

As you can see old-school prop propagation and dependency injection is replaced by simply importing and using the store. How does this affect testability though?

### Testing

Hooks encapsulate pure logic but they can not be tested as such. You must wrap them into components and simulate user interactions to access their logic. Ideally this is fine, since you want to test everything - logic and components alike. Practically no one has time to do that, I usually test my logic and leave my components alone. React Easy State store factories return simple objects, which can be tested as such.

_fetchStore.test.js_

```js
import fetchStore from "./fetchStore";

describe("fetchStore", () => {
  const TEST_URL = "https://test.com/";
  let fetchMock;

  beforeAll(() => {
    fetchMock = jest
      .spyOn(global, "fetch")
      .mockReturnValue(Promise.resolve({ json: () => "Some data" }));
  });
  afterAll(() => {
    fetchMock.mockRestore();
  });

  test("should fetch the required resource", async () => {
    const resource = fetchStore(TEST_URL);

    const fetchPromise = resource.fetch("resource");
    expect(resource.loading).toBe(true);
    expect(fetchMock).toBeCalledWith("https://test.com/resource");
    await fetchPromise;
    expect(resource.loading).toBe(false);
    expect(resource.data).toBe("Some data");
  });
});
```

> [CodeSandbox demo](https://codesandbox.io/s/github/RisingStack/easy-state-hook-examples/tree/master/fetch-store-testing)

### Class components

While hooks are new primitives for function components only, store factories work regardless where they are consumed. This is how you can use our `pokeStore` in a class component.

_App.js_

```jsx
import React, { Component } from "react";
import { view } from "@risingstack/react-easy-state";
import pokeStore from "./pokeStore";

class App extends Component {
  pokemon = pokeStore("ditto");

  render() {
    return (
      <>
        <input
          value={this.pokemon.name.value}
          onChange={this.pokemon.name.onChange}
        />
        <div>
          {this.pokemon.data.loading
            ? "Loading ..."
            : this.pokemon.data.error
            ? "Error!"
            : JSON.stringify(this.pokemon.data.data)}
        </div>
      </>
    );
  }
}

export default view(App);
```

> [CodeSandbox demo](https://codesandbox.io/s/github/RisingStack/easy-state-hook-examples/tree/master/poke-store-class)

> Using store factories in classes still has a few rough edges regarding `autoEffect` cleanup, we will address these in the coming releases.

## Reality check

This article defied a lot of trending patterns, like:

- hooks
- avoiding mutable data
- traditional dependency injection
- and full front-end testing.

While I think all of the above patterns need a revisit, the provided alternatives are not guaranteed to be 'better'. React Easy State has its own rough edges and we are working hard to soften them in the coming releases. As a starter, keep tuned for our 'Idiomatic React Easy State' docs in the near future. Consider this article as a fun and thought provoking experiment in the meantime.

> The important thing is to not stop questioning. Curiosity has its own reason for existing.
>
> -- <cite>Albert Einstein</cite>
