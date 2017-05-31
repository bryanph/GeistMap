
import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

import { scaleLinear } from 'd3-scale'
import { drag as d3Drag } from 'd3-drag'
import { select as d3Select } from 'd3-selection'
import './styles.css'

import { browserHistory } from 'react-router-dom'

import createZoom from '../../graph/zoom'
import createSimulation, { transformNode, transformLink } from '../../graph/simulation'
import createDrag from '../../graph/drag'
import { arrowHead } from '../../graph/svgdefs.js'
import { NODE_RADIUS, WIDTH, HEIGHT } from '../../graph/constants'
import {colorActiveNode } from '../../graph/util'
import { withRouter } from 'react-router-dom'


function getLabelText(text) {
    /*
     * Max length for label text
     */
    if (text.length < 15) {
        return text
    }

    return text
    return text.slice(0, 15) + '...'
}

import { colorNode } from '../../graph/util'

const createEnterNode = (actions: { click: Function }) => {
    /*
     * HOF for enterNode
    */
    return (selection, click) => {
        selection
            .attr("class", "node")
            // .classed('enter-selection', true) // for rxjs..
            // for later reference from data
            .attr('id', (d) => {
                return `node-${d.id}`
            }) 
            .attr('r', NODE_RADIUS)

        selection.on('click', actions.click)

        selection
            .append('circle')
            .attr("r", (d) => NODE_RADIUS)
            .attr("x", -8)
            .attr("y", -8)
            .style("fill", colorNode)

        selection.append('text')
            .attr("dx", NODE_RADIUS + 1)
            .attr("dy", ".35em")
            .text((d) => getLabelText(d.properties.name));

        // remove enter-selection flag for rxjs...
        // selection.classed('enter-selection', false)

        return selection

    }
}

const createEnterCollection = (actions: { click: Function }) => {
    /*
     * HOF for enterNode
    */
    return (selection, click) => {
        selection
            .attr("class", "node")
            // .classed('enter-selection', true) // for rxjs..
            // for later reference from data
            .attr('id', (d) => {
                return `node-${d.id}`
            }) 
            // TODO: this is the only difference between createEnterNode and this function
            // .attr('r', (d) => d.radius)

        selection.on('click', actions.click)

        selection
            .append('circle')
            .attr("r", (d) => d.radius)
            .attr("x", -8)
            .attr("y", -8)
            .style("fill", colorNode)

        selection.append('text')
            .attr("dx", (d) => d.radius)
            .attr("dy", ".35em")
            .text((d) => getLabelText(d.properties.name));

        // remove enter-selection flag for rxjs...
        // selection.classed('enter-selection', false)

        return selection

    }
}
const updateNode = (selection) => {
    selection.select('text').text(d => {
        return getLabelText(d.properties.name)
    })

    return selection
}
const updateCollection = (selection) => {
    selection.select('text')
        .attr("dx", (d) => d.radius)
        .attr("dy", ".35em")
        .text((d) => getLabelText(d.properties.name));

    selection.select('circle')
        .attr("r", (d) => d.radius)

    return selection
}

const createEnterLink = (actions) => {
    return (selection) => {
        return selection
            .append("path")
            .attr('id', (d) => `link-${d.id}`) // for later reference from data
            .attr("class", "node-link")
            .attr("marker-end", "url(#Triangle)")
            .on('dblclick', actions.doubleClick)
        // .append("path")
        // .attr('id', (d) => `link-${d.id}`) // for later reference from data
        // .attr('fill', (d) => lightAccentColor)
        // .attr("class", "node-link")
        // .on('dblclick', events.linkDoubleClick)
        // .attr("marker-mid", "url(#Triangle)")
    }
}

const createInboxEvents = (simulation, actions) => {
    /*
     * in first call creates the drag() object
     * Afterwards, can be called with node an link DOM nodes
     */
    const onNodeClick = (d) => {
        actions.history.push(`/app/inbox/${d.id}`)
    }

    const drag = createDrag(simulation)({ 
        connect: actions.connectNodes,
        click: onNodeClick,
    })

    // TODO: find a way to not have to bind with this here
    // problem is that in the drag event require the actual 'nodes'
    const nodeDrag = d3Drag()
        .on('drag', drag.drag.bind(this))
        .on('start', drag.dragstart.bind(this))
        .on('end', drag.dragend.bind(this))

    const enterNode = createEnterNode({
        click: onNodeClick
    })
    const enterLink = createEnterLink({
        doubleClick: (d) => actions.removeEdge(d.id)
    })

    return (node, link) => {
        // EXIT selection
        node.exit().remove()
        // ENTER selection
        node.enter().append('g').call(enterNode).call(nodeDrag)
        // ENTER + UPDATE selection
            .merge(node).call(updateNode)
        
        // EXIT selection
        link.exit().remove()
        // ENTER selection
        link.enter().insert('g', ":first-child").call(enterLink)
        // ENTER + UPDATE selection
        // .merge(link).call(updateLink)
    }
}


const createExploreEvents = (simulation, actions) => {
    /*
     * in first call creates the drag() object
     * Afterwards, can be called with node an link DOM nodes
     */
    const onNodeClick = (d) => {
        actions.history.push(`/app/nodes/${d.id}`)
    }

    const onConnect = (from, to) => {
        // TODO: make sure this change is represented in the graph
        return actions.connectNodes(from, to)
    }

    const drag = createDrag(simulation)({ 
        connect: onConnect,
        click: onNodeClick,
    })

    // TODO: find a way to not have to bind with this here
    // problem is that in the drag event require the actual 'nodes'
    const nodeDrag = d3Drag()
        .on('drag', drag.drag.bind(this))
        .on('start', drag.dragstart.bind(this))
        .on('end', drag.dragend.bind(this))

    const enterNode = createEnterNode({
        click: onNodeClick
    })
    const enterLink = createEnterLink({
        doubleClick: (d) => actions.removeEdge(d.id)
    })

    return (node, link) => {
        // EXIT selection
        node.exit().remove()
        // ENTER selection
        node.enter().append('g').call(enterNode).call(nodeDrag)
        // ENTER + UPDATE selection
            .merge(node).call(updateNode)
        
        // EXIT selection
        link.exit().remove()
        // ENTER selection
        link.enter().insert('g', ":first-child").call(enterLink)
        // ENTER + UPDATE selection
        // .merge(link).call(updateLink)
    }
}


const createCollectionOverviewEvents = (simulation, actions) => {
    /*
     * in first call creates the drag() object
     * Afterwards, can be called with node an link DOM nodes
     */
    const onCollectionClick = (d) => {
        actions.history.push(`/app/collections/${d.id}`)
    }

    const onConnect = (from, to) => {
        // TODO: make sure this change is represented in the graph
        return actions.connect(from, to)
    }

    const drag = createDrag(simulation)({ 
        connect: onConnect,
        click: onCollectionClick,
    })

    // TODO: find a way to not have to bind with this here
    // problem is that in the drag event require the actual 'nodes'
    const collectionDrag = d3Drag()
        .on('drag', drag.drag.bind(this))
        .on('start', drag.dragstart.bind(this))
        .on('end', drag.dragend.bind(this))

    const enterCollection = createEnterCollection({
        click: onCollectionClick
    })
    const enterLink = createEnterLink({
        doubleClick: (d) => actions.removeEdge(d.id)
    })

    return (node, link) => {
        // EXIT selection
        node.exit().remove()
        // ENTER selection
        node.enter().append('g').call(enterCollection).call(collectionDrag)
        // ENTER + UPDATE selection
            .merge(node).call(updateCollection)
        
        // EXIT selection
        link.exit().remove()
        // ENTER selection
        link.enter().insert('g', ":first-child").call(enterLink)
        // ENTER + UPDATE selection
        // .merge(link).call(updateLink)
    }
}

const createCollectionDetailEvents = (simulation, collectionId, actions) => {
    /*
     * in first call creates the drag() object
     * Afterwards, can be called with node an link DOM nodes
     */
    const onNodeClick = (d) => {
        actions.history.push(`/app/collections/${collectionId}/nodes/${d.id}`)
    }

    const onConnect = (from, to) => {
        // TODO: make sure this change is represented in the graph
        return actions.connectNodes(from, to)
    }

    const drag = createDrag(simulation)({ 
        connect: onConnect,
        click: onNodeClick,
    })

    // TODO: find a way to not have to bind with this here
    // problem is that in the drag event require the actual 'nodes'
    const nodeDrag = d3Drag()
        .on('drag', drag.drag.bind(this))
        .on('start', drag.dragstart.bind(this))
        .on('end', drag.dragend.bind(this))

    const enterNode = createEnterNode({
        click: onNodeClick
    })
    const enterLink = createEnterLink({
        doubleClick: (d) => actions.removeEdge(d.id)
    })

    return (node, link) => {
        // EXIT selection
        node.exit().remove()
        // ENTER selection
        node.enter().append('g').call(enterNode).call(nodeDrag)
        // ENTER + UPDATE selection
            .merge(node).call(updateNode)
        
        // EXIT selection
        link.exit().remove()
        // ENTER selection
        link.enter().insert('g', ":first-child").call(enterLink)
        // ENTER + UPDATE selection
        // .merge(link).call(updateLink)
    }
}


class ForceGraph extends React.Component {
    constructor(props) {
        super(props)

        this.update = this.update.bind(this)
        this.restartSimulation = this.restartSimulation
    }

    update(nextProps) {
        /*
         * Go through the enter,update,exit cycle based on the route
        */
        let { nodes, links, graphType } = nextProps

        // TODO: I actually need previous graph-type events as well in order to do a proper exit() call
        // let events;
        // switch(graphType) {
        //     case 'inbox':
        //         events = inboxEvents;
        //         break;
        //     case 'explore':
        //         events = exploreEvents;
        //         break;
        //     case 'collectionDetail':
        //         events = collectionDetailEvents;
        //         break;
        //     case 'collectionOverview':
        //         events = collectionOverviewEvents;
        //         break;
        //     default:
        //         console.error('This should not happen!')
        //         break;
        // }

        // TODO: this shouldn't be nescessary, only here because some queries give duplicate results - 2017-05-23
        // NodeExplore (getL2), ...
        // nodes = _.uniqBy(nodes, 'id')
        // links = _.uniqBy(links, 'id')

        let nodeById = {}

        // TODO: this only applies to CollectionOverview
        const maxNodeCount = (_.maxBy(nodes, (d) => d.count) || {}).count || 0
        const radiusScale = scaleLinear().domain([0, maxNodeCount]).range([10, 20])

        // set extra properties here
        nodes.forEach(node => {
            node.radius = radiusScale(node.count || 0)
            nodeById[node.id] = node
        })

        links.forEach(link => {
            link.source = nodeById[link.start]
            link.target = nodeById[link.end]
        })

        // set data
        var node = this.d3Graph.selectAll('.node')
            .data(nodes, node => node.id)

        var link = this.d3Graph.selectAll('.node-link')
            .data(links, link => link.id)

        // enter-update-exit cycle depending on type of graph
        if (graphType === 'inbox') {
            this.inboxEvents(node, link)
        } else if (graphType === 'explore') {
            this.exploreEvents(node, link)
        } else if (graphType === 'collectionOverview') {
            this.collectionOverviewEvents(node, link)
        } else if (graphType === 'collectionDetail') {
            this.collectionDetailEvents(node, link)
        } else {
            console.error('this should not happen!')
        }

        this.simulation.nodes(nodes)
        this.simulation.force("link").links(links)

        // TODO: instead,, just compare the reference
        if (nodes.length !== this.props.nodes.length || links.length !== this.props.links.length) {
            this.restartSimulation()
        }

        if (nextProps.selectedId) {
            colorActiveNode(d3Select(`#node-${nextProps.selectedId}`))
        }
    }

    restartSimulation() {
        this.zoomed = false;
        this.simulation.alpha(0.8).restart()
    }

    componentDidMount() {
        const { loadNode, removeEdge, connectNodes, connectCollections, removeCollectionEdge, collectionId } = this.props

        this.d3Graph = d3Select(ReactDOM.findDOMNode(this.refs.graph));
        this.d3Graph.append('defs').call(arrowHead)

        this.simulation = createSimulation(WIDTH, HEIGHT)
        this.zoom = createZoom(this.d3Graph, WIDTH, HEIGHT)

        this.inboxEvents = createInboxEvents.call(this, this.simulation, {
            history: this.props.history,
            removeEdge,
            connectNodes,
        })
        // TODO: connectNodes requires a re-fetch at the moment
        this.exploreEvents = createExploreEvents.call(this, this.simulation, {
            history: this.props.history,
            removeEdge,
            connectNodes,
        })
        // TODO: where to do the data fetching required for the different graphs?
        this.collectionOverviewEvents = createCollectionOverviewEvents.call(this, this.simulation, {
            history: this.props.history,
            removeEdge: removeCollectionEdge,
            connect: connectCollections,
        })
        // TODO: collectionId should be not be static like this - 2017-05-21
        this.collectionDetailEvents = createCollectionDetailEvents.call(this, this.simulation, collectionId, {
            history: this.props.history,
            removeEdge,
            connectNodes,
        })

        //TODO: set to true on initial tick
        let zoomed = false;
        const ticked = (selection) => {
            if (!zoomed && this.simulation.alpha() < 0.75) {
                zoomed = true
                this.zoom(0.95, 1000)
            }

            selection.selectAll('.node')
                .call(transformNode);
            selection.selectAll('.node-link')
                .call(transformLink);
        }

        this.simulation.on('tick', () => {
            // after force calculation starts, call updateGraph
            // which uses d3 to manipulate the attributes,
            // and React doesn't have to go through lifecycle on each tick
            this.d3Graph.call(ticked);
        });

        this.update(this.props)
    }

    shouldComponentUpdate(nextProps) {
        this.update(nextProps)

        return false
    }

    render() {
        return (
            <div id="nodeGraph" className="svg-container">
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
ForceGraph.propTypes = {
    nodes: PropTypes.arrayOf(PropTypes.object).isRequired,
    links: PropTypes.arrayOf(PropTypes.object).isRequired,

    connectNodes: PropTypes.func.isRequired,
    removeEdge: PropTypes.func.isRequired,
}

export default withRouter(ForceGraph)
