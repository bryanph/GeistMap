
/*
 *
 * NodeExploreEditor
 *
 */

import React from 'react';
import { connect } from 'react-redux';

import NodeEditor from '../../containers/NodeEditor'

export class NodeExploreEditor extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
        <NodeEditor 
            className="nodeBatchCreate-sidebar" 
            page="nodes"
            { ...this.props }
        />
    );
  }
}

export default NodeExploreEditor
