
import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import d3 from 'd3'

import CollectionExploreGraph from '../../components/CollectionExploreGraph'

class CollectionExploreGraphContainer extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <CollectionExploreGraph 
                { ...this.props }
                connectNodes={this.props.connectNodes2}
            />
        )
    }
}
CollectionExploreGraphContainer.propTypes = {
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
})(CollectionExploreGraphContainer)
