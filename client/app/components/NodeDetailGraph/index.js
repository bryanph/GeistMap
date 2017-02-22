import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

// TODO: only import things you need - 2016-07-25
import * as d3 from 'd3'
import './styles.css'

// TODO: Use Rx.js Observables for event combinations? - 2016-06-16
// see https://gist.github.com/staltz/868e7e9bc2a7b8c1f754
// take your time to read through this

import { browserHistory } from 'react-router'

import createZoom from '../../graph/zoom'
import createSimulation from '../../graph/simulation'
import { arrowHead } from '../../graph/svgdefs.js'
import { NODE_RADIUS } from '../../graph/constants'
import createDrag from '../../graph/drag'
import createEvents from '../../graph/events'
import createLinkUpdates from '../../graph/link'
import createNodeUpdates from '../../graph/node'

const WIDTH = 250;
const HEIGHT = 250;

// TODO: we only changed WIDTH, HEIGHT in this component, we shouldn't need a full new component like this... - 2016-07-29
class NodeDetailGraph extends React.Component {
    constructor(props) {
        super(props)

        this.update = this.update.bind(this)
    }

    update(nextProps) {
        /*
         * Go through the enter,update,exit cycle
        */
       // TODO: avoid class methods for these types of things- 2016-06-19

        let { nodes, links } = nextProps

        const nodeById = d3.map()

        nodes.forEach(node => {
            nodeById.set(node.id, node)
        })

        links.forEach(link => {
            link.source = nodeById.get(link.start)
            link.target = nodeById.get(link.end)
        })

        var node = this.d3Graph.selectAll('.node')
            // .data(nodes, node => node.id + "_" + node.properties.modified)
            .data(nodes, node => node.id)

        // EXIT selection
        node.exit().call(this.nodeUpdates.exitNode)
        // ENTER selection
        node.enter().append('g').call(this.nodeDrag).call(this.nodeUpdates.enterNode)
            // ENTER + UPDATE selection
            .merge(node).call(this.nodeUpdates.updateNode)

        var link = this.d3Graph.selectAll('.link')
            .data(links, link => link.id)

        // EXIT selection
        link.exit().remove()
        // ENTER selection
        link.enter().insert('g', ":first-child").call(this.linkUpdates.enterLink)
            // .merge(link).call(updateLink)

        this.simulation.nodes(nodes)
            // .on("tick", () => {
            //     this.d3Graph.call(ticked)
            // })

        this.simulation.force("link")
            .links(links)
    }

    componentDidMount() {
        const { loadNode, removeEdge, showGraphSideBar, connectNodes } = this.props

        this.d3Graph = d3.select(ReactDOM.findDOMNode(this.refs.graph));
        this.d3Graph
            .append('defs')
            .call(arrowHead)

        this.zoom = createZoom(this.d3Graph, WIDTH, HEIGHT)

        const { simulation, ticked } = createSimulation(WIDTH, HEIGHT)
        this.simulation = simulation
        this.ticked = ticked

        this.events = createEvents(this.zoom, {
            loadNode,
            removeEdge,
            showGraphSideBar,
        })

        this.drag = createDrag(simulation)({ connectNodes })

        this.nodeDrag = d3.drag()
            .on('drag', this.drag.drag.bind(this))
            .on('start', this.drag.dragstart.bind(this))
            .on('end', this.drag.dragend.bind(this))

        this.nodeUpdates = createNodeUpdates(this.events, this.simulation)(this.zoom)()
        this.linkUpdates = createLinkUpdates(this.events)()


        // append tooltip to the dom
        // this.d3Graph.call(nodeTooltip)
        // this.d3Graph.call(linkTooltip)

        this.update(this.props)

        this.simulation.on('tick', () => {
            // after force calculation starts, call updateGraph
            // which uses d3 to manipulate the attributes,
            // and React doesn't have to go through lifecycle on each tick
            this.d3Graph.call(ticked);
        });

    }

    shouldComponentUpdate(nextProps) {
        this.d3Graph = d3.select(ReactDOM.findDOMNode(this.refs.graph));
        this.update(nextProps)

        return false
    }

    render() {
        return (
            <div id="nodeDetailGraph" className="svg-container">
                <svg 
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="svg-content"
                >
                    <g ref='graph' />
                </svg>
        </div>

        )
    }
}
NodeDetailGraph.propTypes = {
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    links: PropTypes.arrayOf(PropTypes.object).isRequired,

    connectNodes: PropTypes.func.isRequired,
}

import { pure } from 'recompose'

export default pure(NodeDetailGraph)
