/*
 *
 * CollectionOverview
 *
 */

import React from 'react';
import { connect } from 'react-redux';

import SubjectGraph from '../../components/SubjectGraph'
import { accentColor } from '../App/muitheme.js'

import { AddButton } from '../../components/Buttons'
import Spinner from '../../components/Spinner'
import CollectionToolbar from '../../containers/CollectionToolbar'

import './styles.scss'

import { 
    createCollection,
    updateCollection,
    fetchCollections,
    loadCollection,
    connectCollections,
    removeCollection,
    removeCollectionEdge 
} from '../../actions/async'

import { 
    showCreateCollectionWindow,
    toggleEditMode,
    setActiveCollection,
    addCollection,
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
        loadData(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            loadData(nextProps)
        }
    }

    componentWillUnmount() {
        // TODO: get out of edit mode - 2017-06-18
    }

    render() {
        const { loadingStates, collections, collectionLinks, editMode } = this.props

        if (loadingStates.GET_COLLECTIONS) {
            return <Spinner />
        }

        return (
            <div className='appContainer'>
                <SubjectGraph
                    selectedId={this.props.id}
                    nodes={collections || []}
                    links={collectionLinks || []} 
                    connectCollections={this.props.connectCollections}
                    removeCollectionEdge={this.props.removeCollectionEdge}
                    setActiveCollection={this.props.setActiveCollection}
                    addCollection={this.props.addCollection}
                    createCollection={this.props.createCollection}
                    updateCollection={this.props.updateCollection}
                    graphType={'collectionOverview'}
                    editMode={editMode}
                    editFocus={this.props.editFocus}

                />
                <div className="editModeButton-container">
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
        editFocus: state.graphUiState.editFocus,
        // sidebarState: state.uiState.showCollectionSidebarState,
        // activeCollection: getCollection(state, id),
    }
}

export default connect(mapStateToProps, {
    updateCollection,
    createCollection,
    showCreateCollectionWindow,
    fetchCollections,
    loadCollection,
    connectCollections,
    removeCollection,
    removeCollectionEdge,
    setActiveCollection,
    addCollection
})(CollectionOverview);
