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
    return (
        <span className="abstractionList-focusButton">
            <Icon name="circle" style={{ color: props.buttonColor }} onClick={props.onClick} />
        </span>
    );
};

export const Text = ({node, onInput, onKeyDown}) => {
    return (
        <span suppressContentEditableWarning className="abstractionList-text" contentEditable="true" onInput={onInput} onKeyDown={onKeyDown}>
            {node.name}
        </span>
    );
};
Text.propTypes = {
    node: PropTypes.object.isRequired
};

class NodeHeader extends React.Component {
    constructor(props) {
        super(props)

        this.onInput = this.onInput.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
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

        if (!text) {
            return this.updateNode.cancel()
        }

        this.updateNode(
            this.props.node.id,
            {
                name: text
            }
        )
    }

    onKeyDown(event) {
        // pressed return
        if (event.keyCode === 13) {
            event.preventDefault()
            console.log("pressed enter", event)
            // case 1: at the start of the text
            // case 2: at the end of the text
            // case 3: in the middle => split
        }
    }

    render() {
        const {animations, node, onToggleExpand, onFocusClick} = this.props;
        const {active, children} = node;
        const terminal = !node.count;
        const containerClass = classNames("abstractionList-header", {
            active: active
        })

        return (
            <div 
                className={containerClass}
            >
                 <Toggle terminal={terminal} expanded={!node.collapsed} onClick={onToggleExpand}/>
                 <FocusButton onClick={onFocusClick} buttonColor={colorNode(node)}/>
                 <Text node={node} onInput={this.onInput} onKeyDown={this.onKeyDown} />
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
