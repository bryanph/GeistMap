import _ from 'lodash'
import React, { PropTypes } from 'react'

import ForceDirectedGraph from '../../charts/CollectionChart'

export const CollectionChart = React.createClass({

    propTypes: {
        data: PropTypes.array,
        nodes: PropTypes.arrayOf(PropTypes.object),
        edges: PropTypes.arrayOf(PropTypes.object),
    },

    componentDidMount: function() {
        let { nodes, edges } = this.props

        this.graph = new ForceDirectedGraph();
        this.graph.init("#collection-chart")
        this.graph.load(nodes, edges)
    },

    componentDidUpdate: function() {
        let { nodes, edges } = this.props

        // TODO: Make sure this call performs - 2016-04-10
        this.graph.load(nodes, edges)
    }

    render: function() {

        return (
            <div id="collection-chart" />
        )
    }
})
