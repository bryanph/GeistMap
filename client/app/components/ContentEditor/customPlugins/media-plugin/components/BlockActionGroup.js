/*
 * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import React, { Component } from "react";

import BlockAction from "./BlockAction";


export default class BlockActionGroup extends Component {

  renderItem(item) {
    return(<BlockAction item={item} key={item.key} />);
  }

  render() {
    return(
      <ul className="block__action-group">
        {this.props.items.map(this.renderItem)}
      </ul>
    );
  }
}
