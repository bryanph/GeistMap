/*
 *
 * CollectionDetailEditor
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import NodeEditor from '../../containers/NodeEditor'

export class CollectionDetailEditor extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
      const collectionId = this.props.match.params.id
      const nodeId = this.props.match.params.nodeId
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

export default CollectionDetailEditor
