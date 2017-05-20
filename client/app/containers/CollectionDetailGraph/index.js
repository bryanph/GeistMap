
import _ from 'lodash'
import React, { PropTypes } from 'react'
import { withRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import d3 from 'd3'

import CollectionDetailGraph from '../../components/CollectionDetailGraph'

class CollectionDetailGraphContainer extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { nodes, links } = this.props

        return (
            <CollectionDetailGraph 
                collectionId={this.props.collectionId}
                nodes={nodes}
                links={links} 
                selectedNode={this.props.selectedNode}
                { ...this.props }
            />
        )
    }
}
CollectionDetailGraphContainer.propTypes = {
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    links: PropTypes.arrayOf(PropTypes.object).isRequired,
    connectNodes: PropTypes.func.isRequired,
}

import { getNode, getCollection, getNodesByCollectionId, getEdgesByCollectionId } from '../../reducers.js'

function mapStateToProps(state, props) {
    /*
     * id must be passed as props
    */
    
    const { collectionId } = props
    const selectedNode = getNode(state, state.uiState.showGraphSideBarState)

    return {
        selectedNode,
        collectionId,
        collection: getCollection(state, collectionId),
        nodes: getNodesByCollectionId(state, collectionId),
        links: getEdgesByCollectionId(state, collectionId),
        adjacencyMap: state.adjacencyMap
    }
}

import { connectNodes, loadNode, removeEdge } from '../../actions/async'
import { showGraphSideBar } from '../../actions/ui'

export default connect(mapStateToProps, {
    connectNodes,
    loadNode,
    removeEdge,
    showGraphSideBar,
})(withRouter(CollectionDetailGraphContainer))
