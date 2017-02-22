/*
 *
 * CollectionDetail
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import CollectionDetailGraph from '../../containers/CollectionDetailGraph'
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
    return props.loadCollection(props.id)
        .then(() => {
            if (props.nodeId) {
                props.loadNode(props.nodeId)
            }
        })
}


export class CollectionDetail extends React.Component { // eslint-disable-line react/prefer-stateless-function

    componentWillMount() {


        const { nodeId, showGraphSideBar } = this.props
        loadData(this.props)
            .then((action) => this.props.setTitle(`Collection - ${action.response.entities.collections[action.response.result.collection].properties.name}`))

    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id) {
            loadData(nextProps)
        }

        // if (nextProps.nodeId !== this.props.nodeId) {
        //     this.props.loadNode(nextProps.nodeId)
        // }

    }

  render() {
      const { id, nodeId, collection, nodes, loadingStates } = this.props

      if (loadingStates.GET_COLLECTION) {
          return <Spinner />
      }

    return (
        <div className='graphView'>
                {
                    this.props.nodeId ? // TODO: check for is integer instead - 2016-10-07
                        <NodeToolbar 
                            id={nodeId}
                            collectionId={this.props.id}
                            page={`collections/${id}/nodes`}
                        />
                        : null
                }
                {
                    nodes.length ?
                        <CollectionDetailGraph 
                            collectionId={this.props.id} 
                            selected={this.props.nodeId}
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

import { getCollection, isSynced, getNodesByCollectionId } from '../../reducers'

function mapStateToProps(state, props) {
    const id = (props.params && props.params.id) || props.id
    const nodeId = (props.params && props.params.nodeId) || props.nodeId

    return {
        id: id,
        nodeId,
        nodes: getNodesByCollectionId(state, id),
        collection: getCollection(state, id),
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
