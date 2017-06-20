/*
 *
 * InboxEditor
 *
 */

import React from 'react';
import { connect } from 'react-redux';

import NodeEditor from '../../containers/NodeEditor'

export class InboxEditor extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
        <NodeEditor 
            className="nodeBatchCreate-sidebar" 
            page="inbox"
            { ...this.props }
        />
    );
  }
}

export default InboxEditor
