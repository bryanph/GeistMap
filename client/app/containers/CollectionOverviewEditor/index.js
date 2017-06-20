/*
 *
 * CollectionOverviewEditor
 *
 */

import React from 'react';
import { connect } from 'react-redux';

import CollectionEditor from '../../containers/CollectionEditor'

export class CollectionOverviewEditor extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
        <CollectionEditor 
            className="nodeBatchCreate-sidebar" 
            page="collections"
            { ...this.props }
        />
    );
  }
}

export default CollectionOverviewEditor
