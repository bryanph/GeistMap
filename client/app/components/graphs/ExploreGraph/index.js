
import _ from 'lodash'
import React from 'react'
import { withRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import { drag as d3Drag } from 'd3-drag'
import { select as d3Select } from 'd3-selection'
import { event as currentEvent, mouse as currentMouse } from 'd3-selection';
import { scaleLinear } from 'd3-scale'
import { tree as d3Tree, hierarchy as d3Hierarchy } from 'd3-hierarchy'

import createZoom from '../zoom'
import {
    MIN_NODE_RADIUS,
    MAX_NODE_RADIUS,
    NODE_RADIUS,
    WIDTH,
    HEIGHT,
} from '../constants'

import ZoomButtons from '../ZoomButtons'

import HierarchyGraph from '../HierarchyGraph'

class ExploreGraph extends React.Component {

    constructor(props) {
        super(props)

        this.zoomed = this.zoomed.bind(this)

        this.state = {
            containerTransform: `translate(${WIDTH/2}, ${HEIGHT/2})`
        }
    }

    zoomed(transform) {
        this.setState({
            containerTransform: transform
        })
    }

    componentDidMount() {
        const domNode = ReactDOM.findDOMNode(this.refs.graph)
        this.graph = d3Select(domNode);
        this.container = d3Select(ReactDOM.findDOMNode(this.refs.container));

        this.zoom = createZoom(this.graph, this.container, WIDTH, HEIGHT, this.zoomed)

        // this.zoom.zoomFit()
    }

    componentDidUpdate() {
        this.zoom.zoomFit()
    }

    render() {
        // TODO: set the nodes and links here instead of in the graph - 2018-01-29

        const {
            nodesBelowAbstraction,
            edgesBelowAbstraction,
            nodesOutsideAbstraction,
            edgesOutsideAbstraction,
            nodeTree,
        } = this.props

        // console.log(nodeTree, edgesBelowAbstraction)
        console.log("outside", nodesOutsideAbstraction, edgesOutsideAbstraction)

        return [
                <ZoomButtons
                    zoomIn={() => this.zoom.zoomIn()}
                    zoomOut={() => this.zoom.zoomOut()}
                    zoomFit={() => this.zoom.zoomFit()}
                    key="1"
                />,
                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="svg-content focus-graph"
                    ref="graph"
                    key="2"
                >
                    <g ref="container" transform={this.state.containerTransform}>
                        <HierarchyGraph
                            nodeTree={nodeTree}
                            links={edgesBelowAbstraction}
                            isLoading={this.props.isLoading}
                        />
                    </g>
                </svg>
        ]
    }
}

export default withRouter(ExploreGraph)


