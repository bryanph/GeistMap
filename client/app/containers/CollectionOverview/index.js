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
import EditModeButton from '../../components/EditModeButton'

import './styles.scss'

import {
    fetchCollections,
    loadCollectionL1,
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
        onClick={() => props.showCreateCollectionWindow()}
    />
)


function loadData(props) {
    if (props.id) {
        props.loadCollectionL1(props.id)
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
                    nodes={collections || []}
                    links={collectionLinks || []}
                    setActiveCollection={this.props.setActiveCollection}
                    addCollection={this.props.addCollection}
                    updateNode={this.props.updateNode}
                    graphType={'collectionOverview'}
                    mode={mode}
                    focus={this.props.focus}
                />
                <div className="editModeButton-container">
                    {
                        /*
                    <EditModeButton />
                        */
                    }
                </div>
            </div>
        );
    }
}

import { getCollection, getCollections, getCollectionEdges } from '../../reducers'

function mapStateToProps(state, props) {
    const id = props.match.params.collectionId

    return {
        id,
        collections: getCollections(state),
        collectionLinks: getCollectionEdges(state), // links between collections
        loadingStates: state.loadingStates,
        mode: state.abstractGraphUiState.mode,
        focus: state.abstractGraphUiState.focus,
        // sidebarState: state.uiState.showCollectionSidebarState,
        // focusNode: getCollection(state, id),
    }
}

export default connect(mapStateToProps, {
    updateNode,
    showCreateCollectionWindow,
    fetchCollections,
    loadCollectionL1,
    setActiveCollection,
    addCollection
})(CollectionOverview);
