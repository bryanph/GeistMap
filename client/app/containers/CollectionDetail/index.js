/*
 *
 * CollectionDetail
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import ForceGraph from '../../components/ForceGraph'
import AddButton from '../../components/AddButton'
import NodeToolbar from '../../containers/NodeToolbar'
import Spinner from '../../components/Spinner'

import './styles.css'

const AddNodeToCollectionButton = (props) => (
    <AddButton 
        onTouchTap={() => props.showAddNodeToCollectionWindow()}
    />
)


const defaultNode = {
    name: "Untitled"
}

import { accentColor, darkAccentColor } from '../App/muitheme.js'
export const NoNodesYet = (props) => (
    <div className="nodeBatchCreate-noNodesYet">
        <span className="nodeBatchCreate-noNodesYet-text">
            This collection has no nodes yet<br/>Click <span  className="nodeBatchCreate-noNodesYet-start" style={{color: darkAccentColor}} onClick={() => props.createNode(defaultNode)}>here</span> to add a node.
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


        const { nodeId, showGraphSideBar } = this.props
        loadData(this.props)
            .then((action) => this.props.setTitle(`Collection - ${action.response.entities.collections[action.response.result.collection].properties.name}`))

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
      const {nodeId, collection, nodes, links, loadingStates } = this.props

      if (loadingStates.GET_COLLECTION || loadingStates.GET_NODE) {
          return <Spinner />
      }

    return (
        <div className='graphView'>
                {
                    this.props.nodeId ? // TODO: check for is integer instead - 2016-10-07
                        <NodeToolbar
                            id={nodeId}
                            collectionId={this.props.collectionId}
                            page={`collections/${this.props.collectionId}/nodes`}
                        />
                        : null
                }
                {
                    nodes.length ?
                        <ForceGraph 
                            nodes={nodes || []}
                            links={links || []}
                            collectionId={this.props.collectionId} 
                            selectedId={this.props.nodeId}
                            graphType="collectionDetail"
                        />
                        : <NoNodesYet createNode={() => this.props.showAddNodeToCollectionWindow({ collection })}/>
                }
            <div className="collectionDetail-buttons">
                <AddNodeToCollectionButton
                    showAddNodeToCollectionWindow={() => this.props.showAddNodeToCollectionWindow({ collection })}
                />
            </div>
        </div>

    );
  }
}

import { getCollection, isSynced, getNodesByCollectionId, getEdgesByCollectionId } from '../../reducers'

function mapStateToProps(state, props) {
    const collectionId = props.match.params && props.match.params.id
    const nodeId = props.match.params && props.match.params.nodeId

    console.log(collectionId);

    return {
        collectionId,
        nodeId,
        nodes: getNodesByCollectionId(state, collectionId),
        collection: getCollection(state, collectionId),
        links: getEdgesByCollectionId(state, collectionId),
        saved: isSynced(state),
        loadingStates: state.loadingStates
    }
}

import { loadNode, loadCollection } from '../../actions/async'
import { showAddNodeToCollectionWindow, setTitle } from '../../actions/ui'

export default connect(mapStateToProps, {
    loadCollection,
    loadNode,
    showAddNodeToCollectionWindow,
    setTitle,
})(CollectionDetail);
