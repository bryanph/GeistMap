import _ from 'lodash-fp'
import React, { PropTypes } from 'react'

import { connect } from 'react-redux'


import CollectionChart from '../../components/charts/CollectionChart'

let CollectionChartContainer = React.createClass({

    render: function() {
        const { nodes, edges } = this.props

        return (
            <CollectionChart nodes={collections} edges={edges} />
            <div id="collection-chart" />
        )
    }
})

function mapStateProps(state, props) {

    return {
        collections: state.entities.collections,
        edges: state.entities.edges
    }
}

CollectionChartContainer = connect(mapStateToProps)(CollectionChartContainer)
export default CollectionChartContainer

