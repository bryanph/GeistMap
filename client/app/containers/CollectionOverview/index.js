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

import './styles.scss'

import { 
    updateCollection,
    fetchCollections,
    loadCollection,
    connectCollections,
    removeCollection,
    removeCollectionEdge 
} from '../../actions/async'

import { 
    showCreateCollectionWindow,
    setTitle,
    toggleEditMode,
} from '../../actions/ui'


export const AddCollectionShootButton = (props) => (
    <AddButton 
        onTouchTap={() => props.showCreateCollectionWindow()}
    />
)

import { Button, Icon } from 'semantic-ui-react'
let EditModeButton = ({ editMode, toggleEditMode }) => (
    <Button 
        circular icon={ editMode ? "checkmark" : "edit" } size="massive" className="editModeButton"
        onClick={ toggleEditMode }
    />
)
EditModeButton = connect((state) => ({
    editMode: state.uiState.editMode.active 
}),
    { toggleEditMode }
)(EditModeButton)



function loadData(props) {
    if (props.id) {
        props.loadCollection(props.id)
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
      const { loadingStates, collections, collectionLinks, editMode } = this.props

      if (loadingStates.GET_COLLECTIONS) {
          return <Spinner />
      }

    return (
        <div className='appContainer'>
            <ForceGraph
                selectedId={this.props.id}
                nodes={collections || []}
                links={collectionLinks || []} 
                connectCollections={this.props.connectCollections}
                removeCollectionEdge={this.props.removeCollectionEdge}
                graphType={'collectionOverview'}
                editMode={editMode}

            />
            <div className="collectionOverview-buttons">
                <EditModeButton />
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
        editMode: state.uiState.editMode.active,
        // sidebarState: state.uiState.showCollectionSidebarState,
        // activeCollection: getCollection(state, id),
    }
}

export default connect(mapStateToProps, {
    updateCollection,
    showCreateCollectionWindow,
    fetchCollections,
    setTitle,
    loadCollection,
    connectCollections,
    removeCollection,
    removeCollectionEdge,
})(CollectionOverview);
