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
