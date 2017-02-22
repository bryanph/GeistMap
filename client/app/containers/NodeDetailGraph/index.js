
import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import d3 from 'd3'

import NodeDetailGraph from '../../components/NodeDetailGraph'

class NodeDetailGraphContainer extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { nodes, links } = this.props

        return (
            <NodeDetailGraph 
                nodes={nodes}
                links={links} 
                { ...this.props }
            />
        )
    }
}
NodeDetailGraphContainer.propTypes = {
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    links: PropTypes.arrayOf(PropTypes.object).isRequired,
    connectNodes: PropTypes.func.isRequired,
}

import { getNeighbouringNodes, getEdgesByNodeId } from '../../reducers'

function mapStateToProps(state, props) {
    /*
     * id must be passed as props
    */

    const { id } = props

    return {
        nodes: getNeighbouringNodes(state, id),
        links: getEdgesByNodeId(state, id),
    }
}

import { connectNodes, removeEdge } from '../../actions/async'
import { pure } from 'recompose'

export default connect(mapStateToProps, {
    connectNodes,
    removeEdge,
})(NodeDetailGraphContainer)
