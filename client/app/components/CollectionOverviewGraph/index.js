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

import { colorNode } from '../../graph/util'
import createZoom from '../../graph/zoom'
import createSimulation from '../../graph/simulation'
import { arrowHead } from '../../graph/svgdefs.js'
import { NODE_RADIUS, WIDTH, HEIGHT } from '../../graph/constants'
import createDrag from '../../graph/drag'
import createCustomEvents from './events'
import createLinkUpdates from '../../graph/link'
import createNodeUpdates from '../../graph/node'

class CollectionExploreGraph extends React.Component {
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

        // console.log(`in update with ${nodes.length} nodes and ${links.length} links`);

        const maxNodeCount = d3.max(nodes, (d) => d.count)
        const radiusScale = d3.scaleLinear().domain([0, maxNodeCount]).range([10, 20])

        const nodeById = d3.map()

        nodes.forEach(node => {
            node.radius = radiusScale(node.count || 0)
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
        node.enter().append('g').call((selection) => this.nodeUpdates.enterNode(selection, radiusScale)).call(this.nodeDrag)
            // ENTER + UPDATE selection
            .merge(node).call(this.nodeUpdates.updateNode)

        var link = this.d3Graph.selectAll('.node-link')
            .data(links, link => link.id)

        // EXIT selection
        link.exit().remove()
        // ENTER selection
        link.enter().insert('g', ":first-child").call(this.linkUpdates.enterLink)
            // .merge(link).call(updateLink)

        this.simulation.nodes(nodes)
        this.simulation.force("link")
            .links(links)

        if (nodes.length !== this.props.nodes.length || links.length !== this.props.links.length) {
            this.simulation.alpha(0.8).restart();
        }
    }

    componentDidMount() {
        const { loadCollection, removeEdge, showCollectionSidebar, connectCollections } = this.props

        this.d3Graph = d3.select(ReactDOM.findDOMNode(this.refs.graph));
        this.d3Graph
            .append('defs')
            .call(arrowHead)

        const { simulation, ticked } = createSimulation(WIDTH, HEIGHT)
        this.simulation = simulation
        this.ticked = ticked


        this.zoom = createZoom(this.d3Graph, WIDTH, HEIGHT)

        const customEvents = createCustomEvents({
            router: this.props.router,
            loadCollection,
            removeEdge,
            showCollectionSidebar,
        })

        const forceDrag = createDrag(this.simulation)({ connect: connectCollections }, customEvents.nodeClickNoDrag)
        this.nodeDrag = d3.drag()
            .on('drag', forceDrag.drag.bind(this))
            .on('start', forceDrag.dragstart.bind(this))
            .on('end', forceDrag.dragend.bind(this))

        this.nodeUpdates = createNodeUpdates({
            noDefaultEnter: true,
            events: customEvents,
            zoom: this.zoom,
            paddingPercent: 0.95,
        })([ customEvents.enterNode ], [], [])

        this.linkUpdates = createLinkUpdates(customEvents)()

        this.update(this.props)

        this.simulation.on('tick', () => {
            // after force calculation starts, call updateGraph
            // which uses d3 to manipulate the attributes,
            // and React doesn't have to go through lifecycle on each tick
            this.d3Graph.call(ticked);
        });

        if (this.props.id) {
            /*
             * initialize initial shown node
             */
            showCollectionSidebar(this.props.id)
        }

        setTimeout(() => {
            console.log(this.props.selected);
            colorNode(d3.select(`#node-${this.props.selected}`))
        }, 0)
    }

    shouldComponentUpdate(nextProps) {
        this.d3Graph = d3.select(ReactDOM.findDOMNode(this.refs.graph));

        this.update(nextProps)

        if (nextProps.selected && nextProps.selected !== this.props.selected) {
            setTimeout(() => {
                colorNode(d3.select(`#node-${nextProps.selected}`))
            }, 0)
        }

        return false
    }

    render() {
        return (
            <div id="collectionOverviewGraph" className="svg-container">
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
CollectionExploreGraph.propTypes = {
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    links: PropTypes.arrayOf(PropTypes.object).isRequired,

    connectNodes: PropTypes.func.isRequired,
}

import { pure } from 'recompose'
import { withRouter } from 'react-router'

export default withRouter(CollectionExploreGraph)
