'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {VelocityTransitionGroup} from 'velocity-react';

import NodeHeader from './header';

import { Loading } from './decorators'

class TreeNode extends React.Component {
    constructor() {
        super();

        this.onToggleExpand = this.onToggleExpand.bind(this);
        this.onFocusClick = this.onFocusClick.bind(this);

    }


    onToggleExpand() {
        const {node} = this.props;
        const { collapsed } = node;

        this.props.onToggleExpand(node, collapsed)
    }

    onFocusClick() {
        const {node} = this.props;

        this.props.onFocusClick(node)
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
            <div className="abstractionList-children">
                <VelocityTransitionGroup 
                    {...restAnimationInfo}
                    ref={ref => this.velocityRef = ref}>
                    {!collapsed ? this.renderChildren(animations) : null}
                </VelocityTransitionGroup>
            </div>
        );
    }

    renderHeader(animations) {
        const {node} = this.props;

        return (
            <NodeHeader 
                animations={animations}
                node={Object.assign({}, node)}
                onClick={this.onClick}
                onToggleExpand={this.onToggleExpand}
                onFocusClick={this.onFocusClick}
                updateNode={this.props.updateNode}
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
                        updateNode={this.props.updateNode}
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
        const { onFocusClick, onToggleExpand } = this.props;

        return {
            onFocusClick,
            onToggleExpand,
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
