/*
 * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import React, {Component} from "react";

import Dropdown from "./Dropdown";

import BlockActionGroup from "./BlockActionGroup"
import BlockControls from "./BlockControls"
import BlockWrapper from "./BlockWrapper"

import {
    DEFAULT_DISPLAY_OPTIONS,
    DEFAULT_DISPLAY_KEY,
    DEFAULT_ALIGN_OPTIONS,
    DEFAULT_ALIGN_KEY
} from "./defaults";


export default class CommonBlock extends Component {
    constructor(props) {
        super(props);

        this._handleDisplayChange = this._handleDisplayChange.bind(this);
        this._handleAlignChange = this._handleAlignChange.bind(this);
    }

    _handleDisplayChange(newValue) {
        this.props.container.updateData({display: newValue});
    }

    _handleAlignChange(newValue) {
        this.props.container.updateData({align: newValue});
    }

    render(){
        const data = this.props.data;
        const defaults = {
            defaultDisplay: DEFAULT_DISPLAY_KEY,
            displayOptions: DEFAULT_DISPLAY_OPTIONS,
            defaultAlign: DEFAULT_ALIGN_KEY,
            alignOptions: DEFAULT_ALIGN_OPTIONS,

        };
        // let options = this.props.blockProps.plugin.options || {};
        // options = {...defaults, ...options};
        let options = defaults

        return (
            <BlockWrapper>
                <BlockControls>

                    <Dropdown
                        items={options.displayOptions}
                        selected={data.display || options.defaultDisplay}
                        onChange={this._handleDisplayChange} />
                    <Dropdown
                        items={options.alignOptions}
                        selected={data.align || options.defaultAlign}
                        onChange={this._handleAlignChange} />

                    <BlockActionGroup items={this.props.actions} />
                </BlockControls>

                {this.props.children}
            </BlockWrapper>
        );
    }
}
