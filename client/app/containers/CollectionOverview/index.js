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
import EditModeButton from '../../components/EditModeButton'

import './styles.scss'

import {
    createCollection,
    fetchCollections,
    getCollectionL1,
    connectCollections,
    removeCollection,
} from '../../actions/collection'

import {
    updateNode,
} from '../../actions/node'

import {
    showCreateCollectionWindow,
    setActiveCollection,
    addCollection,
} from '../../actions/ui'


export const AddCollectionShootButton = (props) => (
    <AddButton
        onTouchTap={() => props.showCreateCollectionWindow()}
    />
)


function loadData(props) {
    if (props.id) {
        props.getCollectionL1(props.id)
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
        const { loadingStates, collections, collectionLinks, mode } = this.props

        if (loadingStates.GET_COLLECTIONS) {
            return <Spinner />
        }

        return (
            <div className='appContainer'>
                <SubjectGraph
                    selectedId={this.props.id}
                    collectionChainIds={this.props.collectionChainIds}
                    nodes={collections || []}
                    links={collectionLinks || []}
                    connectCollections={this.props.connectCollections}
                    setActiveCollection={this.props.setActiveCollection}
                    addCollection={this.props.addCollection}
                    createCollection={this.props.createCollection}
                    updateNode={this.props.updateNode}
                    graphType={'collectionOverview'}
                    mode={mode}
                    focus={this.props.focus}

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
    const collectionChainIds = props.match.params.collectionChain && props.match.params.collectionChain.split('/')
    const id = collectionChainIds && collectionChainIds[collectionChainIds.length-1]

    return {
        collectionChainIds,
        id,
        collections: getCollections(state),
        collectionLinks: getCollectionEdges(state), // links between collections
        loadingStates: state.loadingStates,
        mode: state.graphUiState.mode,
        focus: state.graphUiState.focus,
        // sidebarState: state.uiState.showCollectionSidebarState,
        // activeCollection: getCollection(state, id),
    }
}

export default connect(mapStateToProps, {
    updateNode,
    createCollection,
    showCreateCollectionWindow,
    fetchCollections,
    getCollectionL1,
    connectCollections,
    removeCollection,
    setActiveCollection,
    addCollection
})(CollectionOverview);
