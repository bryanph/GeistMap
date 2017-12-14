import _ from 'lodash'
import React from 'react'
import { withRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import { drag as d3Drag } from 'd3-drag'
import { select as d3Select } from 'd3-selection'
import { event as currentEvent, mouse as currentMouse } from 'd3-selection';

import { browserHistory } from 'react-router-dom'

import { createNodeSimulation, transformNode, transformLink } from './simulation'
import createDrag from './drag'
import createZoom from '../../graph/zoom'
import { arrowHead } from '../../graph/svgdefs.js'
import {
    MIN_NODE_RADIUS,
    MAX_NODE_RADIUS,
    NODE_RADIUS,
    WIDTH,
    HEIGHT,
} from '../../graph/constants'

import ZoomButtons from '../ZoomButtons'

import './styles.scss'

import {
    scaleOrdinal,
    scaleLinear,
    schemeCategory20,
    schemeCategory20b,
    schemeCategory20c
} from 'd3-scale'

const colora = scaleOrdinal(schemeCategory20)
const colorb = scaleOrdinal(schemeCategory20b)
const colorc = scaleOrdinal(schemeCategory20c)

// work around for now to make sure collections have a fixed color
colora(undefined)
colorb(undefined)
colorc(undefined)

function colorNode(d) {
    /*
     * Assign a color to a node based on its collections
    */
    if (d.type === 'node') {
        return colora(_.flatten(d.collections).sort().join(','))
    } else {
        return colora([d.id, ..._.flatten(d.collections)].sort().join(','))

    }
}

function colorActiveNode(node) {
    d3Select(".nodeActive").classed("nodeActive", false)
    node.classed("nodeActive", true)
}

function getLabelText(text) {
    /*
     * Max length for label text
     */
    if ( text && text.length < 15) {
        return text
    }

    return text
    // return text.slice(0, 15) + '...'
}

const createEnterNode = function(actions) {
    /*
     * HOF for enterNode
    */
    return (selection, click) => {
        selection
            .attr("class", "nodeSelection node")
            .attr('id', (d) => `node-${d.id}`)
            .attr('r', (d) => d.radius)

        selection
            .append('circle')
            .attr("r", (d) => d.radius)
            .attr("x", (d) => -d.radius)
            .attr("y", (d) => -d.radius)
            .style("fill", colorNode)

        // TODO: split into lines when text gets too big - 2017-06-22
        selection.append('text')
            .attr("dy", (d) => d.radius + 10)
            .text((d) => getLabelText(d.name));

        return selection
    }
}

const createUpdateNode = (actions) => (selection, mode, focus) => {
    selection.select('text').text(d => {
        return getLabelText(d.name)
    })

    selection.selectAll('.editMode').remove()
    selection.on('click', null)

    if (mode === 'view') {
        // make click go to editor
        // selection.on('click', actions.onViewClick)
    }
    else if (mode === 'edit') {
        if (focus.id) {

            const nodeSelection = d3Select(`#node-${focus.id}`)

            const editMode = nodeSelection.append('g')
                .attr('class', 'editMode')

            const div = editMode.append('foreignObject')
                .attr('x', -100)
                .attr('y', (d) => d.radius + 1)
                .attr('width', 200)
                .attr('height', 100)
                .append('xhtml:div')

            // div.attr("style", `width: ${sqLen}px; height: ${sqLen}px;`)

            const textarea = div.append('textarea')
                .attr('maxLength', 50)
                .attr('autofocus', true)
                .text((d) => d.name)
                .on("keydown", function(d) {
                    const e = currentEvent;

                    if (e.which === 13) {
                        e.stopPropagation()
                        const value = editMode.select('textarea').node().value

                        actions.onEditSave(d, value)
                    }
                })
            // .style("height", sqLen)
            setTimeout(() => textarea.node().select(), 0)
        }
        else {
            // change click to edit node
            // selection.on('click', actions.onEditClick)
            selection.on('click', actions.onViewClick)
            selection.selectAll('text').on('click', actions.onEditClick)
        }
    }
    else if (mode === 'abstract') {
        // TODO: move up in abstraction? - 2017-09-05
        selection.on('click', actions.onAbstractClick)
    }
    else if (mode === 'focus') {
        selection.on('click', actions.onFocusClick)
    }
    else if (mode === 'delete') {
        selection.on('click', actions.onDeleteClick)
    }

    return selection
}

const createEnterCollection = function(actions) {
    /*
     * HOF for enterNode
    */
    return (selection, click) => {
        selection
            .attr("class", "nodeSelection node")
            .attr('id', (d) => `node-${d.id}`)
            .attr('r', (d) => d.radius)

        selection
            .append('circle')
            .attr("r", (d) => d.radius)
            .attr("x", (d) => -d.radius)
            .attr("y", (d) => -d.radius)
            .style("fill", colorNode)

        // TODO: split into lines when text gets too big - 2017-06-22
        selection.append('text')
            .attr("dy", (d) => d.radius + 10)
            .text((d) => getLabelText(d.name));

        return selection
    }
}

const createUpdateCollection = (actions) => (selection, mode, focus) => {
    selection.select('text').text(d => {
        return getLabelText(d.name)
    })

    selection.select('.editMode').remove()
    selection.on('click', null)

    if (mode === 'view') {
        // make click go to editor
        // selection.on('click', actions.onViewClick)
    }
    else if (mode === 'edit') {
        if (focus.id) {
            selection.on('click', null)

            const nodeSelection = d3Select(`#node-${focus.id}`)

            const editMode = nodeSelection.append('g')
                .attr('class', 'editMode')

            const div = editMode.append('foreignObject')
                .attr('x', -100)
                .attr('y', (d) => d.radius + 1)
                .attr('width', 200)
                .attr('height', 100)
                .append('xhtml:div')

            // div.attr("style", `width: ${sqLen}px; height: ${sqLen}px;`)

            const textarea = div.append('textarea')
                .attr('maxLength', 50)
                .attr('autofocus', true)
                .text((d) => d.name)
                .on("keydown", function(d) {
                    const e = currentEvent;

                    if (e.which === 13) {
                        e.stopPropagation()
                        // on enter, update node

                        const value = editMode.select('textarea').node().value
                        actions.onEditSave(d, value)
                    }
                })
            // .style("height", sqLen)
            setTimeout(() => textarea.node().select(), 0)
        }
        else {
            // change click to edit node
            selection.on('click', actions.onViewClick)
            selection.selectAll('text').on('click', actions.onEditClick)
        }
    }
    else if (mode === 'abstract') {
        selection.on('click', actions.onAbstractClick)
    }
    else if (mode === 'focus') {
        selection.on('click', actions.onFocusClick)
    }
    else if (mode === 'delete') {
        selection.on('click', actions.onDeleteClick)
    }

    return selection
}

const createEnterLink = function(actions) {
    return (selection) => {
        const g = selection
            .insert("g", ":first-child")
            .attr('id', (d) => `link-${d.id}`)
            .attr("class", "link")

        // transparent clickable edge
        g
            .append("path")
            .attr("class", "node-link-transparent")
            .attr("marker-end", "url(#Triangle)")
            // .on('dblclick', actions.doubleClick)

        // visible non-clickable edge
        g
            .append("path")
            .attr("class", "node-link")
            .attr("marker-end", "url(#Triangle)")
    }
}

const createUpdateLink = function({ onDeleteClick }) {
    return (selection, mode) => {
        selection.on('click', null)

        if (mode === 'delete') {
            selection.on('click', onDeleteClick)
        }
    }
}

const createExploreEvents = function(simulation, actions) {
    /*
     * in first call creates the drag() object
     * Afterwards, can be called with node an link DOM nodes
     */
    const onViewClick = (d) => {
        actions.history.push(`/app/nodes/${d.id}/edit`)
    }

    const onEditClick = (d) => {
        actions.setActiveNode(d.id)
    }

    const onAbstractClick = (d) => {
        actions.history.push(`/app/nodes/${d.id}/`)
    }

    const onFocusClick = (d) => {
        actions.history.push(`/app/nodes/${d.id}/`)
    }

    const onDeleteClick = (d) => {
        // TODO: confirmation - 2017-09-15
        actions.removeNode(d.id)
    }

    const onEditSave = (d, value) => {
        actions.updateNode(d.id, { name: value })
        actions.setActiveNode(null)
    }

    const onConnect = (from, to) => {
        // this call is done from the abstractiondetail graph
        return actions.connectNodes(from, to)
    }

    const drag = createDrag(simulation)({
        connect: onConnect,
    })

    const nodeDrag = d3Drag()
        .on('drag', drag.drag.bind(this))
        .on('start', drag.dragstart.bind(this))
        .on('end', drag.dragend.bind(this))

    const enterNode = createEnterNode()

    const updateNode = createUpdateNode({
        onViewClick,
        onEditClick,
        onEditSave,
        onFocusClick,
        onAbstractClick,
        onDeleteClick,
    })

    const enterLink = createEnterLink()

    const updateLink = createUpdateLink({
        onDeleteClick: (d) => {
            actions.removeEdge(d.id)
        }
    })

    return (nodeId, nodeSelection, link, mode, focus) => {
        if (this.props.mode !== mode) {
            nodeSelection.call((selection) => updateNode(selection, mode, focus))
            link.call((selection) => updateLink(selection, mode))
        } else {
            // EXIT selection
            nodeSelection.exit().remove()
            // ENTER selection
            nodeSelection.enter().append('g').call(enterNode).call(nodeDrag)
            // ENTER + UPDATE selection
                .merge(nodeSelection).call((selection) => updateNode(selection, mode, focus))

            // EXIT selection
            link.exit().remove()
            // ENTER selection
            link.enter().call(enterLink)
            // ENTER + UPDATE selection
                // .merge(link).call(updateLink)

            // color node
            colorActiveNode(d3Select(`#node-${nodeId}`))
        }
    }
}

const createCollectionDetailEvents = function(simulation, actions) {
    /*
     * in first call creates the drag() object
     * Afterwards, can be called with node an link DOM nodes
     */

    const onViewClick = (d) => {
        // click in view mode
        actions.history.push(`/app/collections/${this.props.activeCollection.id}/nodes/${d.id}/edit`)
    }

    const onEditClick = (d) => {
        actions.setActiveNode(d.id)
    }

    const onAbstractClick = (d) => {
        this.props.moveChild(d.id)
        this.props.history.push(`/app/collections/${d.id}/nodes`)
    }

    const onFocusClick = (d) => {
        actions.history.push(`/app/nodes/${d.id}/`)
    }

    const onDeleteClick = (d) => {
        actions.removeNodeFromCollection(this.props.activeCollection.id, d.id)
    }

    const onEditSave = (d, value) => {
        actions.updateNode(d.id, { name: value })
        actions.setActiveNode(null)
    }

    const onConnect = (from, to) => {
        // this call is done from the abstractiondetail graph
        return actions.connectNodes(from, to, this.props.activeCollection.id)
    }

    const drag = createDrag(simulation)({
        connect: onConnect,
        moveToAbstraction: actions.moveToAbstraction,
    })

    const nodeDrag = d3Drag()
        .on('drag', drag.drag.bind(this))
        .on('start', drag.dragstart.bind(this))
        .on('end', drag.dragend.bind(this))

    const enterNode = createEnterCollection()

    const updateNode = createUpdateCollection({
        onViewClick,
        onEditClick,
        onEditSave,
        onAbstractClick,
        onFocusClick,
        onDeleteClick,
    })

    const enterLink = createEnterLink()

    const updateLink = createUpdateLink({
        onDeleteClick: (d) => actions.removeEdge(d.id)
    })

    return (nodeSelection, link, mode, focus) => {
        // if mode changed, update everything

        if (this.props.mode !== mode) {
            nodeSelection.call((selection) => updateNode(selection, mode, focus))
            link.call((selection) => updateLink(selection, mode))
        } else {
            // EXIT selection
            nodeSelection.exit().remove()
            // ENTER selection
            nodeSelection.enter().append('g').call(enterNode).call(nodeDrag)
                .merge(nodeSelection).call((selection) => updateNode(selection, mode, focus))

            // EXIT selection
            link.exit().remove()
            // ENTER selection
            link.enter().call(enterLink)
            // ENTER + UPDATE selection
            // .merge(link).call(updateLink)
        }
    }
}


class NodeGraph extends React.Component {
    constructor(props) {
        super(props)

        this.update = this.update.bind(this)
        this.restartSimulation = this.restartSimulation.bind(this)
        this.stopSimulation = this.stopSimulation.bind(this)
    }

    update(nextProps) {
        /*
         * Go through the enter,update,exit cycle based on the route
        */
        let {
            isLoading,
            nodes,
            links,
            graphType,
            mode, // mode of the graph
            focus, // is a single node being edited?
        } = nextProps

        if (isLoading) {
            return;
        }

        let nodeById = {}

        const maxCount = (_.maxBy(nodes, (d) => d.count) || {}).count || 0
        const maxRadiusDomain = maxCount > 10 ? maxCount : 10
        const radiusScale = scaleLinear().domain([0, maxRadiusDomain]).range([MIN_NODE_RADIUS, MAX_NODE_RADIUS])

        nodes.forEach(node => {
            nodeById[node.id] = node
            node.radius = radiusScale(node.count || 0)
        })

        const adjacencyMap = nextProps.adjacencyMap
        const reverseAdjacencyMap = nextProps.reverseAdjacencyMap
        links.forEach(link => {
            link.source = nodeById[link.start]
            link.target = nodeById[link.end]

            if (adjacencyMap[link.end] && adjacencyMap[link.end].includes(link.start)) {
                link.curved = true
            } else {
                link.curved = false
            }

        })

        // set data
        var nodeSelection = this.container.selectAll('.nodeSelection')
            .data(nodes, x => x.id + x.count)

        var link = this.container.selectAll('.link')
            .data(links, link => link.id)

        // enter-update-exit cycle depending on type of graph
        if (graphType === 'node') {
            this.exploreEvents(nextProps.activeNodeId, nodeSelection, link, mode, focus)
        } else if (graphType === 'collection') {
            this.collectionDetailEvents(nodeSelection, link, mode, focus)
        } else {
            console.error('this should not happen!')
        }

        this.simulation.nodes(nodes)
        this.simulation.force("link").links(links)

        if (
            nodes !== (this.prevProps && this.prevProps.nodes) ||
            links !== (this.prevProps && this.prevProps.links))
        {
            this.zoomed = false
            this.restartSimulation()
        }

        // nescessary because not using react here
        this.prevProps = { nodes, links }
    }

    restartSimulation() {
        // TODO: do two zooms, an initial "guess" zoom and another for accuracy - 2017-06-07
        // this.zoomed = false;
        this.simulation.alpha(0.8).restart()
    }

    stopSimulation() {
        this.simulation.stop()
    }

    componentDidMount() {
        const {
            isLoading,
            graphType,
            loadNode,
            removeEdge,
            connectNodes,
        } = this.props

        const domNode = ReactDOM.findDOMNode(this.refs.graph)
        this.graph = d3Select(domNode);
        this.container = d3Select(ReactDOM.findDOMNode(this.refs.container));
        this.container.append('defs').call(arrowHead)

        this.graph.dragLine = this.container
            .append("path")
            .attr("class", "node-link")
            .attr("marker-end", "url(#Triangle)")

        this.simulation = createNodeSimulation(WIDTH, HEIGHT)

        // this must be before zoom
        this.graph.on('mousedown', () => {
            const [ x, y ] = currentMouse(domNode)

            if (this.props.editMode && graphType === 'collection') {
                // prompt for a node name
                // this.props.addNode({ x, y })
            }
        })

        this.zoom = createZoom(this.graph, this.container, WIDTH, HEIGHT)

        this.exploreEvents = createExploreEvents.call(this, this.simulation, {
            history: this.props.history,
            removeEdge,
            connectNodes,
            setActiveNode: this.props.setActiveNode,
            updateNode: this.props.updateNode,
            removeNode: this.props.removeNode,
            moveToAbstraction: this.props.moveToAbstraction,
        })

        this.collectionDetailEvents = createCollectionDetailEvents.call(this, this.simulation, {
            history: this.props.history,
            removeEdge,
            connectNodes,
            fetchNodeL1: this.props.fetchNodeL1,
            setActiveNode: this.props.setActiveNode,
            updateNode: this.props.updateNode,
            removeNode: this.props.removeNode,
            removeNodeFromCollection: this.props.removeNodeFromCollection,
            removeAbstraction: this.props.removeAbstraction,
            toggleCollapse: this.props.toggleCollapse,
            moveToAbstraction: this.props.moveToAbstraction,
        })

        this.zoomed = false

        const ticked = (selection) => {
            if (!this.zoomed && this.simulation.alpha() < 0.6) {
                this.zoomed = true
                this.zoom.zoomFit()
            }

            selection.selectAll('.nodeSelection')
                .call(transformNode);

            selection.selectAll('.link')
                .each(transformLink)
        }

        this.simulation.on('tick', () => {
            // after force calculation starts, call updateGraph
            // which uses d3 to manipulate the attributes,
            // and Reac.6t doesn't have to go through lifecycle on each tick
            this.container.call(ticked);
        });


        this.update(this.props)
    }

    shouldComponentUpdate(nextProps) {
        if (this.props !== nextProps) {
            this.update(nextProps)
        }

        return false
    }

    render() {
        // TODO: should be set somewhere up high so shouldComponentUpdate can return false - 2017-06-21
        // const className = 'svg-content' + (this.props.editMode ? ' editMode' : '')

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
                    className="svg-content"
                    ref="graph"
                    key="2"
                >
                    <g ref="container" />
                </svg>
        ]
    }
}

export default withRouter(NodeGraph)
