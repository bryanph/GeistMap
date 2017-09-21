'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import TreeNode from './node';
import defaultAnimations from '../themes/animations';

import './styles.scss'

class TreeBeard extends React.Component {
    render() {
        const { animations, data: propsData, onFocusClick, onToggleExpand } = this.props;
        let data = propsData;

        // Support Multiple Root Nodes. Its not formally a tree, but its a use-case.
        if (!Array.isArray(data)) {
            data = [data];
        }
        return (
            <ul className="abstractionList">
                {data.map((node, index) =>
                    <TreeNode animations={animations}
                              key={node.id || index}
                              node={node}
                              onFocusClick={onFocusClick}
                              onToggleExpand={onToggleExpand}
                    />
                )}
            </ul>
        );
    }
}

TreeBeard.propTypes = {
    data: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array
    ]).isRequired,
    animations: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.bool
    ]),
    onToggle: PropTypes.func,
};

TreeBeard.defaultProps = {
    animations: defaultAnimations,
};

export default TreeBeard;
