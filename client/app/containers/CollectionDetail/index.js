/*
 *
 * CollectionDetail
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import NodeGraph from '../../components/NodeGraph'
import AddButton from '../../components/AddButton'
import Spinner from '../../components/Spinner'
import AddNodeWindow from '../../components/AddNodeWindow'

import './styles.scss'

import {
    loadNode,
    loadCollection,
} from '../../actions/async'

import {
    addNode,
    showAddNodeToCollectionWindow,
    toggleEditMode,
} from '../../actions/ui'

const AddNodeToCollectionButton = (props) => (
    <AddButton 
        onTouchTap={() => props.showAddNodeToCollectionWindow()}
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



const defaultNode = {
    name: "Untitled"
}

export const NoNodesYet = (props) => (
    <div className="collectionDetail-noNodesYet">
        <span className="collectionDetail-noNodesYet-text">
            This collection has no nodes yet<br/>Click <span className="collectionDetail-noNodesYet-start" onClick={() => props.createNode(defaultNode)}>here</span> to add a node.
        </span>
    </div>
)


function loadData(props) {
    return props.loadCollection(props.collectionId)
        .then((action) => {
            if (props.nodeId) {
                props.loadNode(props.nodeId)
                return action
            }

            return action
        })
}


export class CollectionDetail extends React.Component { // eslint-disable-line react/prefer-stateless-function

    componentWillMount() {
        loadData(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.collectionId !== this.props.collectionId) {
            loadData(nextProps)
        }

        // if (nextProps.nodeId !== this.props.nodeId) {
        //     this.props.loadNode(nextProps.nodeId)
        // }

    }

    render() {
        const {nodeId, collection, nodes, links, loadingStates, editMode } = this.props

        if (loadingStates.GET_COLLECTION || loadingStates.GET_NODE) {
            return <Spinner />
        }

        return (
            <div className='appContainer'>
                <AddNodeWindow opened={true} />
                {
                    nodes.length ?
                        <NodeGraph 
                            nodes={nodes || []}
                            links={links || []}
                            collectionId={this.props.collectionId} 
                            selectedId={this.props.nodeId}
                            graphType="collectionDetail"
                            editMode={editMode}
                            addNode={this.props.addNode}
                        />
                        : <NoNodesYet createNode={() => this.props.showAddNodeToCollectionWindow({ collection })}/>
                }
                <div className="editModeButton-container">
                    <EditModeButton />
                </div>
            </div>

        );
    }
}

import {
    getCollection,
    isSynced,
    getNodesByCollectionId,
    getEdgesByCollectionId,
} from '../../reducers'

function mapStateToProps(state, props) {
    const collectionId = props.match.params && props.match.params.id
    const nodeId = props.match.params && props.match.params.nodeId

    return {
        collectionId,
        nodeId,
        editMode: state.uiState.editMode.active,
        nodes: getNodesByCollectionId(state, collectionId),
        collection: getCollection(state, collectionId),
        links: getEdgesByCollectionId(state, collectionId),
        saved: isSynced(state),
        loadingStates: state.loadingStates
    }
}

export default connect(mapStateToProps, {
    loadCollection,
    loadNode,
    showAddNodeToCollectionWindow,
    addNode,
})(CollectionDetail);
