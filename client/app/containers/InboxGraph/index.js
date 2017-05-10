
import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import d3 from 'd3'

import NodeGraph from '../../components/NodeGraph'

class NodeOverviewGraphContainer extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <NodeGraph 
                { ...this.props }
            />
        )
    }
}
NodeOverviewGraphContainer.propTypes = {
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    links: PropTypes.arrayOf(PropTypes.object).isRequired,
    connectNodes: PropTypes.func.isRequired,
}

import { loadNode, connectNodes, createBatchNode, updateNode, removeNode, removeEdge, getAllBatchNodes, clearBatchNodes } from '../../actions/async'
import { showGraphSideBar, hideGraphSideBar, setTitle, changeMainFocus } from '../../actions/ui'

export default connect(null, {
    connectNodes,
    createBatchNode,
    updateNode,
    removeNode,
    removeEdge,
    loadNode,
    getAllBatchNodes,
    clearBatchNodes,
    showGraphSideBar,
    hideGraphSideBar,
    setTitle,
    changeMainFocus
})(NodeOverviewGraphContainer)
