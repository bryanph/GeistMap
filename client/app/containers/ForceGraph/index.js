import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import ForceGraph from '../../components/ForceGraph'

import { 
    loadNode,
    connectNodes,
    createBatchNode,
    updateNode,
    removeNode,
    removeEdge,
    getAllBatchNodes,
} from '../../actions/async'

import { 
    setTitle,
} from '../../actions/ui'

function mapStateToProps(state, props) {
    /*
     * Based on the route, pass different props for node
    */
    const { graphType } = props

    return props
}

export default connect(mapStateToProps, {
    connectNodes,
    createBatchNode,
    updateNode,
    removeNode,
    removeEdge,
    loadNode,
    getAllBatchNodes,
    setTitle,
})(ForceGraph)
