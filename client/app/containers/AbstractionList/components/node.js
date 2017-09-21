'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {VelocityTransitionGroup} from 'velocity-react';

import NodeHeader from './header';

import { Loading } from './decorators'

class TreeNode extends React.Component {
    constructor() {
        super();

        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        const {node, onToggle} = this.props;
        const { collapsed } = node;

        if (onToggle) {
            onToggle(node, collapsed);
        }
    }

    animations() {
        const {animations, node} = this.props;

        if (animations === false) {
            return false;
        }

        const anim = Object.assign({}, animations, node.animations);
        return {
            toggle: anim.toggle(this.props),
            drawer: anim.drawer(this.props)
        };
    }

    render() {
        const animations = this.animations();

        return (
            <li className="abstractionList-node">
                {this.renderHeader(animations)}
                {this.renderDrawer(animations)}
            </li>
        );
    }

    renderDrawer(animations) {
        const {node: { collapsed }} = this.props;

        if (!animations && collapsed) {
            return null;
        } else if (!animations && !collapsed) {
            return this.renderChildren( animations);
        }

        const {animation, duration, ...restAnimationInfo} = animations.drawer;
        return (
            <VelocityTransitionGroup {...restAnimationInfo}
                                     ref={ref => this.velocityRef = ref}>
                {!collapsed ? this.renderChildren(animations) : null}
            </VelocityTransitionGroup>
        );
    }

    renderHeader(animations) {
        const {node} = this.props;

        return (
            <NodeHeader 
                animations={animations}
                node={Object.assign({}, node)}
                onClick={this.onClick}
            />
        );
    }

    renderChildren() {
        const { animations, node } = this.props;

        if (node.loading) {
            return this.renderLoading();
        }

        let children = node.children;
        if (!Array.isArray(children)) {
            children = children ? [children] : [];
        }

        return (
            <ul className="abstractionList-node subtree">
                {children.map((child, index) => 
                    <TreeNode 
                        {...this._eventBubbles()}
                        animations={animations}
                        key={child.id || index}
                        node={child}
                    />
                )}
            </ul>
        );
    }

    renderLoading() {
        return (
            <ul>
                <li>
                    <Loading />
                </li>
            </ul>
        );
    }

    _eventBubbles() {
        const {onToggle} = this.props;

        return {
            onToggle
        };
    }
}

TreeNode.propTypes = {
    node: PropTypes.object.isRequired,
    animations: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.bool
    ]).isRequired,
    onToggle: PropTypes.func
};

export default TreeNode;
