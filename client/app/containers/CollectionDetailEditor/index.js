/*
 *
 * CollectionDetailEditor
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'

import NodeEditor from '../../containers/NodeEditor'

export class CollectionDetailEditor extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
      const collectionId = this.props.match.params.id
      const nodeId = this.props.match.params.nodeId

      console.log(collectionId, nodeId);
    return (
        <NodeEditor 
            className="nodeBatchCreate-sidebar" 
            page={`collections/${collectionId}/nodes`}
            id={nodeId}
            collectionId={collectionId}
        />
    );
  }
}

export default withRouter(CollectionDetailEditor)
