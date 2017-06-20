/*
 * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import React, { Component } from "react";


export default
class BlockAction extends Component {

  render() {
    const Icon = this.props.item.icon;
    return(
      <li className="block__action" onClick={this.props.item.action}>
        <Icon className="block__action__icon" />
      </li>
    );
  }
}
