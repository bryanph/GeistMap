'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import deepEqual from 'lodash/isEqual'

import { Toggle, Header } from './decorators.js'
import classNames from 'classnames'
import { VelocityComponent } from 'velocity-react';

class NodeHeader extends React.Component {
    shouldComponentUpdate(nextProps) {
        const props = this.props;
        const nextPropKeys = Object.keys(nextProps);

        for (let i = 0; i < nextPropKeys.length; i++) {
            const key = nextPropKeys[i];
            if (key === 'animations') {
                continue;
            }

            if (props[key] !== nextProps[key]) {
                return true;
            }
        }

        return !deepEqual(props.animations, nextProps.animations, {strict: true});
    }

    render() {
        const {animations, node, onClick} = this.props;
        const {active, children} = node;
        const terminal = !children;
        const containerClass = classNames('link', {
            active: active
        })

        return (
            <div 
                onClick={onClick}
                className={containerClass}
            >
                 {!terminal ? this.renderToggle() : null}

                 <Header node={node} />
            </div>
        );
    }

    renderToggle() {
        const {animations} = this.props;

        if (!animations) {
            return <Toggle />
        }

        return (
            <VelocityComponent
                animation={animations.toggle.animation}
                duration={animations.toggle.duration}
            >
                <Toggle />
            </VelocityComponent>
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
