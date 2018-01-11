'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import deepEqual from 'lodash/isEqual'

import classNames from 'classnames'
import { VelocityComponent } from 'velocity-react';

import { Icon } from 'semantic-ui-react'

// TODO: different location - 2018-01-11
import { colorNode } from '../../../components/graphs/colorNode.js'

export const Toggle = ({ expanded, terminal, onClick}) => {
    const icon = expanded ? "minus": "plus"

    return (
        <span className="abstractionList-toggle">
            <Icon 
                style={{ visibility: terminal ? "hidden" : "visible" }}
                name={ icon }
                onClick={onClick} 
            />
        </span>
    );
};

export const FocusButton = (props) => {
    console.log(props)
    return (
        <span className="abstractionList-focusButton">
            <Icon name="circle" style={{ color: props.buttonColor }} onClick={props.onClick} />
        </span>
    );
};

export const Header = ({node, onInput}) => {
    return (
        <div className="abstractionList-header">
            <div className="title" contentEditable="true" onInput={onInput}>
                {node.name}
            </div>
        </div>
    );
};
Header.propTypes = {
    node: PropTypes.object.isRequired
};

class NodeHeader extends React.Component {
    constructor(props) {
        super(props)

        this.onInput = this.onInput.bind(this);
        this.updateNode = _.debounce(props.updateNode, 1000)
    }


    shouldComponentUpdate(nextProps) {
        const props = this.props;
        const nextPropKeys = Object.keys(nextProps);

        for (let i = 0; i < nextPropKeys.length; i++) {
            const key = nextPropKeys[i];
            if (props[key] !== nextProps[key]) {
                return true;
            }
        }
    }

    onInput(event) {
        // necessary for debounce
        event.persist()

        const text = event.target.textContent

        this.updateNode(
            this.props.node.id,
            {
                name: text
            }
        )
    }

    render() {
        const {animations, node, onToggleExpand, onFocusClick} = this.props;
        const {active, children} = node;
        const terminal = !node.count;
        const containerClass = classNames({
            active: active
        })

        return (
            <div 
                className={containerClass}
            >
                 <Toggle terminal={terminal} expanded={!node.collapsed} onClick={onToggleExpand}/>
                 <FocusButton onClick={onFocusClick} buttonColor={colorNode(node)}/>
                 <Header node={node} onInput={this.onInput} />
            </div>
        );
    }
}

NodeHeader.propTypes = {
    animations: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.bool
    ]).isRequired,
    node: PropTypes.object.isRequired,
    onClick: PropTypes.func
};

export default NodeHeader;
