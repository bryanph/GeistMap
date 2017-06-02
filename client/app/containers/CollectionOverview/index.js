/*
 *
 * CollectionOverview
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import ForceGraph from '../../components/ForceGraph'
import { accentColor } from '../App/muitheme.js'

import { AddButton } from '../../components/Buttons'
import Spinner from '../../components/Spinner'
import CollectionToolbar from '../../containers/CollectionToolbar'

import './styles.css'

export const NoCollectionsYet = (props) => (
    <div className="collectionOverview-noCollectionsYet">
        <span className="collectionOverview-noCollectionsYet-text">
            No Collections yet!<br/>Click <span  className="collectionOverview-noCollectionsYet-start" style={{color: accentColor}} onClick={() => props.createCollection()}>here</span> to create your first
        </span>
    </div>
)

export const AddCollectionShootButton = (props) => (
    <AddButton 
        onTouchTap={() => props.showCreateCollectionWindow()}
    />
)

function loadData(props) {
    if (props.id) {
        props.loadCollection(props.id)
            // .then(() => props.showCollectionSidebar({ id: props.id }))
    }
}

export class CollectionOverview extends React.Component { // eslint-disable-line react/prefer-stateless-function

    componentWillMount() {
        this.props.fetchCollections()
        this.props.setTitle('Collections')

        loadData(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            loadData(nextProps)
        }
    }

  render() {
      const { loadingStates, collections, collectionLinks } = this.props

      if (loadingStates.GET_COLLECTIONS) {
          return <Spinner />
      }

    return (
        <div className='appContainer'>
            {
                this.props.id ? // TODO: check for is integer instead - 2016-10-07
                    <CollectionToolbar 
                        id={this.props.id}
                        page="collections"
                    />
                    : null
            }
        {
            collections.length ?
                    <ForceGraph
                        selectedId={this.props.id}
                        nodes={collections || []}
                        links={collectionLinks || []} 
                        connectCollections={this.props.connectCollections}
                        removeCollectionEdge={this.props.removeCollectionEdge}
                        graphType={'collectionOverview'}

                    />
                : <NoCollectionsYet createCollection={this.props.showCreateCollectionWindow}/>
        }
            <div className="collectionOverview-buttons">
                <AddCollectionShootButton
                    showCreateCollectionWindow={this.props.showCreateCollectionWindow}
                />
            </div>
        </div>
    );
  }
}

import { getCollection, getCollections, getCollectionEdges } from '../../reducers'

function mapStateToProps(state, props) {
    const id = (props.match.params && props.match.params.id) || props.id

    return {
        id,
        collections: getCollections(state),
        collectionLinks: getCollectionEdges(state), // links between collections
        loadingStates: state.loadingStates,
        // sidebarState: state.uiState.showCollectionSidebarState,
        // activeCollection: getCollection(state, id),
    }
}

import { updateCollection, fetchCollections, loadCollection, connectCollections, removeCollection, removeCollectionEdge } from '../../actions/async'
import { showCollectionSidebar, showCreateCollectionWindow, setTitle  } from '../../actions/ui'

export default connect(mapStateToProps, {
    updateCollection,
    showCreateCollectionWindow,
    fetchCollections,
    setTitle,
    loadCollection,
    // showCollectionSidebar,
    connectCollections,
    removeCollection,
    removeCollectionEdge,
})(CollectionOverview);
