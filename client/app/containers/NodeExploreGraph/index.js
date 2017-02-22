
import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import d3 from 'd3'

import NodeExploreGraph from '../../components/NodeExploreGraph'

import './styles.css'

class NodeExploreGraphContainer extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <NodeExploreGraph 
                { ...this.props }
                connectNodes={this.props.connectNodes2}
            />
        )
    }
}
NodeExploreGraphContainer.propTypes = {
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    links: PropTypes.arrayOf(PropTypes.object).isRequired,
    connectNodes: PropTypes.func.isRequired,
}

import { connectNodes, loadNode, removeEdge } from '../../actions/async'
import { showGraphSideBar } from '../../actions/ui'
import { pure } from 'recompose'

export default connect(null, {
    connectNodes,
    loadNode,
    removeEdge,
    showGraphSideBar,
})(NodeExploreGraphContainer)
