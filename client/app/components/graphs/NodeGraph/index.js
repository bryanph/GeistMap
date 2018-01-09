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
import { createOuterDrag, createInnerDrag } from './drag'
import createZoom from '../zoom'
import { arrowHead } from '../svgdefs.js'
import {
    MIN_NODE_RADIUS,
    MAX_NODE_RADIUS,
    NODE_RADIUS,
    WIDTH,
    HEIGHT,
} from '../constants'

import ZoomButtons from '../ZoomButtons'

import './styles.scss'

import {
    colorNode,
    colorActiveNode,
} from '../colorNode'

import {
    scaleLinear,
} from 'd3-scale'

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

        selection.append('circle')
            .attr('class', "outerCircle")
            .attr("r", (d) => d.radius)
            .attr("x", (d) => -(d.radius))
            .attr("y", (d) => -(d.radius))
            .style("fill", colorNode)

        selection
            .append('circle')
            .attr('class', "innerCircle")
            .attr("r", (d) => d.innerRadius)
            .attr("x", (d) => -d.innerRadius)
            .attr("y", (d) => -d.innerRadius)
            .style("fill", "#fff")

        // TODO: split into lines when text gets too big - 2017-06-22
        selection.append('text')
            .attr("dy", (d) => (d.radius) + 10)
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
        selection.on('click', actions.onClick)
        selection.selectAll('text').on('click', actions.onEditClick)
    }

    selection.on('click', actions.onAbstractClick)

    return selection
}

const createUpdateCollection = (actions) => (selection, mode, focus) => {

    selection.select('text').text(d => {
        return getLabelText(d.name)
    })
    selection.select('.editMode').remove()
    selection.on('click', actions.onAbstractClick)

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
        selection.on('click', actions.onClick)
        selection.selectAll('text').on('click', actions.onEditClick)
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
            .attr("stroke-opacity", (d) => d.opacity)
            .attr("class", "node-link-transparent")
            .attr("marker-end", "url(#Triangle)")
        // .on('dblclick', actions.doubleClick)

        // visible non-clickable edge
        g
            .append("path")
            .attr("stroke-opacity", (d) => d.opacity)
            .attr("class", "node-link")
            .attr("marker-end", "url(#Triangle)")
    }
}

const createUpdateLink = function({ onDeleteClick }) {
    return (selection, mode) => {
        selection.on('click', null)

        // if (mode === 'delete') {
        //     selection.on('click', onDeleteClick)
        // }
    }
}

const createExploreEvents = function(simulation, actions) {
    /*
     * in first call creates the drag() object
     * Afterwards, can be called with node an link DOM nodes
     */
    const onClick = (d) => {
        actions.history.push(`/app/nodes/${d.id}/graph?graphType=explore`)
    }

    const onEditClick = (d) => {
        actions.setActiveNode(d.id)
    }
    const onEditSave = (d, value) => {
        actions.updateNode(d.id, { name: value })
        actions.setActiveNode(null)
    }

    const onConnect = (from, to) => {
        // this call is done from the abstractiondetail graph
        return actions.connectNodes(from, to)
    }

    const outerDragEvents = createOuterDrag(simulation)({
        connect: onConnect,
        moveToAbstraction: actions.moveToAbstraction,
    })

    const innerDragEvents = createInnerDrag(simulation)({
        connect: onConnect,
        moveToAbstraction: actions.moveToAbstraction,
    })

    const outerDrag = d3Drag()
        .on('drag', outerDragEvents.drag.bind(this))
        .on('start', outerDragEvents.dragstart.bind(this))
        .on('end', outerDragEvents.dragend.bind(this))

    const innerDrag = d3Drag()
        .on('drag', innerDragEvents.drag.bind(this))
        .on('start', innerDragEvents.dragstart.bind(this))
        .on('end', innerDragEvents.dragend.bind(this))

    const enterNode = createEnterNode()

    const updateNode = createUpdateNode({
        onEditClick,
        onEditSave,
        onClick
    })

    const enterLink = createEnterLink()

    const updateLink = createUpdateLink({
        onDeleteClick: (d) => {
            actions.removeEdge(d.id)
        }
    })

    return (nodeId, nodeSelection, link, mode, focus) => {
        // EXIT selection
        nodeSelection.exit().remove()
        // ENTER selection
        const nodeEnter = nodeSelection.enter().append('g').call(enterNode)
        nodeEnter.call(innerDrag)
        nodeEnter.selectAll('.outerCircle').call(outerDrag)

        // ENTER + UPDATE selection
        const nodeMerge = nodeEnter.merge(nodeSelection).call((selection) => updateNode(selection, mode, focus))

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

const createCollectionDetailEvents = function(simulation, actions) {
    /*
     * in first call creates the drag() object
     * Afterwards, can be called with node an link DOM nodes
     */

    const onEditClick = (d) => {
        actions.setActiveNode(d.id)
    }

    const onEditSave = (d, value) => {
        actions.updateNode(d.id, { name: value })
        actions.setActiveNode(null)
    }

    const onClick = (d) => {
        this.props.moveChild(d.id)
        this.props.history.push(`/app/nodes/${d.id}/graph?graphType=abstract`)
    }

    const onConnect = (from, to) => {
        // this call is done from the abstractiondetail graph
        return actions.connectNodes(from, to, this.props.focusNode.id)
    }

    const outerDragEvents = createOuterDrag(simulation)({
        connect: onConnect,
        moveToAbstraction: actions.moveToAbstraction,
    })

    const innerDragEvents = createInnerDrag(simulation)({
        connect: onConnect,
        moveToAbstraction: actions.moveToAbstraction,
    })

    const outerDrag = d3Drag()
        .on('drag', outerDragEvents.drag.bind(this))
        .on('start', outerDragEvents.dragstart.bind(this))
        .on('end', outerDragEvents.dragend.bind(this))

    const innerDrag = d3Drag()
        .on('drag', innerDragEvents.drag.bind(this))
        .on('start', innerDragEvents.dragstart.bind(this))
        .on('end', innerDragEvents.dragend.bind(this))

    const enterNode = createEnterNode()

    const updateNode = createUpdateCollection({
        onEditClick,
        onEditSave,
        onClick,
    })

    const enterLink = createEnterLink()

    const updateLink = createUpdateLink({
        onDeleteClick: (d) => actions.removeEdge(d.id)
    })

    return (nodeSelection, link, mode, focus) => {
        // if mode changed, update everything

        // EXIT selection
        nodeSelection.exit().remove()
        // ENTER selection
        const nodeEnter = nodeSelection.enter().append('g').call(enterNode)
        nodeEnter.call(innerDrag)
        nodeEnter.selectAll('.outerCircle').call(outerDrag)

        const nodeUpdate = nodeEnter.merge(nodeSelection).call((selection) => updateNode(selection, mode, focus))

        // EXIT selection
        link.exit().remove()
        // ENTER selection
        link.enter().call(enterLink)
        // ENTER + UPDATE selection
        // .merge(link).call(updateLink)
    }
}

class NodeGraph extends React.Component {
    constructor(props) {
        super(props)

        this.update = this.update.bind(this)
        this.restartSimulation = this.restartSimulation.bind(this)
        this.stopSimulation = this.stopSimulation.bind(this)

        this.onZoom = this.onZoom.bind(this)

        this.state = {
            zoomTransform: null
        }
    }

    onZoom(transform) {
        this.container.attr("transform", transform)
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
        const strokeScale = scaleLinear().domain([0, 10]).range([0.3, 1])


        const outerRadiusScale = 1.4

        nodes.forEach(node => {
            nodeById[node.id] = node
            node.radius = radiusScale(node.count || 0) * outerRadiusScale
            node.innerRadius = node.radius / outerRadiusScale
        })

        const adjacencyMap = nextProps.adjacencyMap
        const reverseAdjacencyMap = nextProps.reverseAdjacencyMap
        links.forEach(link => {
            link.source = nodeById[link.start]
            link.target = nodeById[link.end]

            link.opacity = strokeScale(link.count || 0)

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
        if (graphType === 'explore') {
            this.exploreEvents(nextProps.focusNodeId, nodeSelection, link, mode, focus)
        } else if (graphType === 'abstract') {
            this.collectionDetailEvents(nodeSelection, link, mode, focus)
        } else {
            console.error('this should not happen!')
        }

        this.simulation.nodes(nodes)
        this.simulation.force("link").links(links)

        if (
            nodes.length !== (this.prevProps && this.prevProps.nodes.length) ||
            links.length !== (this.prevProps && this.prevProps.links.length))
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

            if (this.props.editMode && graphType === 'abstract') {
                // prompt for a node name
                // this.props.addNode({ x, y })
            }
        })

        this.zoom = createZoom(this.graph, this.container, WIDTH, HEIGHT, this.onZoom)

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
                className="svg-content abstract-graph"
                ref="graph"
                key="2"
            >
                <g ref="container" />
            </svg>
        ]
    }
}

export default withRouter(NodeGraph)
