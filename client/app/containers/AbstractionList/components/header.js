'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import deepEqual from 'lodash/isEqual'

import classNames from 'classnames'
import { VelocityComponent } from 'velocity-react';

import { Icon } from 'semantic-ui-react'
export const Toggle = ({ expanded, terminal, onClick}) => {
    const icon = expanded ? "minus": "plus"

    return (
        <Icon 
            style={{ visibility: terminal ? "hidden" : "visible" }}
            name={ icon }
            onClick={onClick} 
        />
    );
};

export const FocusButton = (props) => {
    return (
        <Icon name="circle" onClick={props.onClick} />
    );
};

export const Header = ({node}) => {
    return (
        <div className="abstractionList-header">
            <div className="title" contenteditable="true">
                {node.name}
            </div>
        </div>
    );
};
Header.propTypes = {
    node: PropTypes.object.isRequired
};

class NodeHeader extends React.Component {
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

    render() {
        const {animations, node, onToggleExpand, onFocusClick} = this.props;
        const {active, children} = node;
        const terminal = !node.count;
        const containerClass = classNames('link', {
            active: active
        })

        return (
            <div 
                className={containerClass}
            >
                 <Toggle terminal={terminal} expanded={!node.collapsed} onClick={onToggleExpand}/>
                 <FocusButton onClick={onFocusClick}/>
                 <Header node={node} />
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
