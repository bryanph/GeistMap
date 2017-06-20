/*
 * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import React, { Component } from "react";
import classNames from "classnames";


export default class DropdownItem extends Component {
    props: {
        item: {},
        selected: string,
        onChange: func,
    }

    render() {
        const Icon = this.props.item.icon;
        const className = classNames("dropdown__item ", this.props.className);

        return(
            <div
                className={className}
                onClick={this.props.onClick}
                onMouseDown={this.props.onMouseDown}
                onMouseUp={this.props.onMouseDown}>

                <Icon className="dropdown__item__icon" />
                <span className="dropdown__item__text">{this.props.item.label}</span>

                {this.props.children}
            </div>
        );
    }
}
