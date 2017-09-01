import _ from 'lodash'
import React from 'react'
import { withRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import { drag as d3Drag } from 'd3-drag'
import { select as d3Select } from 'd3-selection'
import { event as currentEvent, mouse as currentMouse } from 'd3-selection';

import { browserHistory } from 'react-router-dom'

import createZoom from '../../graph/zoom'
import { createNodeSimulation, transformNode, transformLink } from './simulation'
import createDrag from './drag'
import { arrowHead } from '../../graph/svgdefs.js'
import { MIN_NODE_RADIUS, MAX_NODE_RADIUS, NODE_RADIUS, WIDTH, HEIGHT } from '../../graph/constants'

import ZoomButtons from '../ZoomButtons'

import './styles.scss'

import {
    scaleOrdinal,
    scaleLinear,
    schemeCategory20,
    schemeCategory20b,
    schemeCategory20c
} from 'd3-scale'

export const colora = scaleOrdinal(schemeCategory20)
export const colorb = scaleOrdinal(schemeCategory20b)
export const colorc = scaleOrdinal(schemeCategory20c)

// work around for now to make sure collections have a fixed color
colora(undefined)
colorb(undefined)
colorc(undefined)

export function colorNode(d) {
    /*
     * Assign a color to a node based on its collections
    */
    if (d.type === 'node') {
        return colora(_.flatten(d.collectionChains).sort().join(','))
    } else {
        return colora([d.id, ..._.flatten(d.collectionChains)].sort().join(','))

    }
}

function getLabelText(text) {
    /*
     * Max length for label text
     */
    if ( text && text.length < 15) {
        return text
    }

    return text
    return text.slice(0, 15) + '...'
}

const createEnterNode = function(actions: { click: Function }) {
    /*
     * HOF for enterNode
    */
    return (selection, click) => {
        selection
            .attr("class", "nodeSelection node")
            .attr('id', (d) => {
                return `node-${d.id}`
            })
            .attr('r', (d) => d.radius)

        selection.on('click', actions.click)

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
        selection.on('click', actions.onNodeClick)
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
                        // on enter, update node
                        const value = editMode.select('textarea').node().value
                        actions.updateNode(d.id, { name: value })
                        actions.setActiveNode(null)
                    }
                })
            // .style("height", sqLen)
            setTimeout(() => textarea.node().select(), 0)
        }
        else {
            // change click to edit node
            selection.on('click', (d) => {
                actions.setActiveNode(d.id)
            })
        }

    }
    // insert an editable text field at the bottom
    else if (mode === 'focus') {
        selection.on('click', (d) => {
            // go to NodeExplore, which will transition node to center and perform the fetching and filtering
            if (d.type === "node") {
                actions.history.push(`/app/nodes/${d.id}`)
            }
        })
    }
    else if (mode === 'delete') {
        selection.on('click', (d) => {
            if (d.type === "node") {
                // TODO: ask for a confirmation
                actions.removeNode(d.id)
            }
        })
    }

    return selection
}

const createEnterCollection = function(actions: { click: Function }) {
    /*
     * HOF for enterNode
    */
    return (selection, click) => {
        selection
            .attr("class", "collectionSelection node")
            .attr('id', (d) => `node-${d.id}`)
            .attr('r', (d) => d.radius)

        selection.on('click', actions.click)

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
        selection.on('click', (d) => {
            actions.history.push(`/app/collections/${d.id}/edit`)
        })
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
                        actions.updateNode(d.id, { name: value })
                        actions.setActiveNode(null)
                    }
                })
            // .style("height", sqLen)
            setTimeout(() => textarea.node().select(), 0)
        }
        else {
            // change click to edit node
            selection.on('click', (d) => {
                actions.setActiveNode(d.id)
            })
        }
    }
    else if (mode === 'focus') {
        selection.on('click', (d) => {
            if (d.type === "collection") {
                actions.history.push(`/app/collections/${d.id}/nodes`)
            }
        })
    }
    else if (mode === 'expand') {
        /*
         * Expand the collection
        */
        selection.on('click', function(d) {
            actions.toggleCollapse(d.id)
        })
    }
    else if (mode === 'delete') {
        selection.on('click', (d) => {
            if (d.type === "collection") {
                // TODO: ask for a confirmation
                actions.removeAbstraction(d.id)
            }
        })
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

const createUpdateLink = function({ onClick }) {
    return (selection, mode) => {
        selection.on('click', null)

        if (mode === 'delete') {
            selection.on('click', onClick)
        }
    }
}

const createExploreEvents = function(simulation, actions) {
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
        moveToAbstraction: actions.moveToAbstraction,
    })

    // TODO: find a way to not have to bind with this here
    // problem is that in the drag event require the actual 'nodes'
    const nodeDrag = d3Drag()
        .on('drag', drag.drag.bind(this))
        .on('start', drag.dragstart.bind(this))
        .on('end', drag.dragend.bind(this))

    const enterNode = createEnterNode({
        onNodeClick
    })

    const updateNode = createUpdateNode({
        onNodeClick,
        updateNode: actions.updateNode,
        removeNode: actions.removeNode,
        history: actions.history,
        setActiveNode: actions.setActiveNode,
    })

    const enterLink = createEnterLink({
        doubleClick: (d) => actions.removeEdge(d.id)
    })

    return (node, link, mode, focus) => {
        // EXIT selection
        node.exit().remove()
        // ENTER selection
        node.enter().append('g').call(enterNode).call(nodeDrag)
        // ENTER + UPDATE selection
            .merge(node).call((selection) => updateNode(selection, mode, focus))

        // EXIT selection
        link.exit().remove()
        // ENTER selection
        link.enter().call(enterLink)
        // ENTER + UPDATE selection
        // .merge(link).call(updateLink)
    }
}

const createCollectionDetailEvents = function(simulation, actions) {
    /*
     * in first call creates the drag() object
     * Afterwards, can be called with node an link DOM nodes
     */
    const onNodeClick = (d) => {
        actions.history.push(`/app/collections/${this.props.activeCollection.id}/nodes/${d.id}/edit`)
    }

    const onConnect = (from, to) => {
        // this call is done from the abstractiondetail graph
        return actions.connectNodes(from, to, this.props.activeCollection.id)
    }

    const removeAbstraction = (id) => {
        return actions.removeAbstraction(id)
    }

    const removeNode = (id) => {
        return actions.removeNode(id, this.props.activeCollection.id)
    }

    const drag = createDrag(simulation)({
        connect: onConnect,
        moveToAbstraction: actions.moveToAbstraction,
    })

    const nodeDrag = d3Drag()
        .on('drag', drag.drag.bind(this))
        .on('start', drag.dragstart.bind(this))
        .on('end', drag.dragend.bind(this))

    const enterNode = createEnterNode({
        onNodeClick
    })

    const updateNode = createUpdateNode({
        onNodeClick,
        updateNode: actions.updateNode,
        removeNode: removeNode,
        history: actions.history,
        setActiveNode: actions.setActiveNode,
    })

    const enterCollection = createEnterCollection({
        onNodeClick
    })

    const updateCollection = createUpdateCollection({
        toggleCollapse: actions.toggleCollapse,
        // onNodeClick,
        updateNode: actions.updateNode,
        removeAbstraction: removeAbstraction,
        history: actions.history,
        setActiveNode: actions.setActiveNode,
    })

    const enterLink = createEnterLink({
        doubleClick: (d) => actions.removeEdge(d.id)
    })

    const updateLink = createUpdateLink({
        onClick: (d) => actions.removeEdge(d.id)
    })

    return (nodeSelection, collectionSelection, link, mode, focus) => {
        // TODO: if the mode changed, all nodes need to be updated - 2017-07-08
        // one way is to just set a flag on the data

        // if mode changed, update everything
        // TODO: find a different way to achieve this
        if (this.props.mode !== mode) {
            nodeSelection.call((selection) => updateNode(selection, mode, focus))
            collectionSelection.call((selection) => updateCollection(selection, mode, focus))
            link.call((selection) => updateLink(selection, mode))
        } else {
            // EXIT selection
            nodeSelection.exit().remove()
            collectionSelection.exit().remove()
            // ENTER selection
            nodeSelection.enter().append('g').call(enterNode).call(nodeDrag)
            .merge(nodeSelection).call((selection) => updateNode(selection, mode, focus))

            collectionSelection.enter().append('g').call(enterCollection).call(nodeDrag)
            .merge(collectionSelection).call((selection) => updateCollection(selection, mode, focus))

            // EXIT selection
            link.exit().remove()
            // ENTER selection
            link.enter().call(enterLink)
            // ENTER + UPDATE selection
            // .merge(link).call(updateLink)
        }


    }
}


class NodeGraph extends React.PureComponent {
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
            collections,
            links,
            graphType,
            mode, // mode of the graph
            focus, // is a single node being edited?
            activeNode, // if a single node is focused
            activeCollection,
        } = nextProps

        if (isLoading) {
            return;
        }

        let nodeById = {}

        // TODO: this only applies to CollectionOverview
        const maxCount = (_.maxBy(collections, (d) => d.count) || {}).count || 0
        const maxRadiusDomain = maxCount > 10 ? maxCount : 10
        const radiusScale = scaleLinear().domain([0, maxRadiusDomain]).range([MIN_NODE_RADIUS, MAX_NODE_RADIUS])

        console.log(nodes, collections, links)

        // make sure there are no duplicates in nodes, edges
        // TODO: shouldn't be nescessary - 2017-06-21
        // nodes = _.uniqBy(nodes, (node) => node.id)
        // collections = _.uniqBy(collections, (node) => node.id)
        // links = _.uniqBy(links, (link) => link.id)

        // TODO: shouldn't have to happen here - 2017-07-14
        // collections = collections.filter(c => c.collapsed)
        collections.forEach(c => {
            nodeById[c.id] = c

            c.radius = radiusScale(c.count || 0)
        })

        // set extra properties here
        nodes.forEach(node => {
            nodeById[node.id] = node
            node.radius = NODE_RADIUS
        })

        links.forEach(link => {
            link.source = nodeById[link.start]
            link.target = nodeById[link.end]

            // console.log(link.start, link.source, link.target);
        })

        // set data
        var nodeSelection = this.container.selectAll('.nodeSelection')
            .data(nodes, x => x.id)

        var collectionSelection = this.container.selectAll('.collectionSelection')
            .data(collections, x => x.id)

        var link = this.container.selectAll('.link')
            .data(links, link => link.id)

        // enter-update-exit cycle depending on type of graph
        if (graphType === 'node') {
            this.exploreEvents(nodeSelection, link, mode, focus)
        } else if (graphType === 'collection') {
            this.collectionDetailEvents(nodeSelection, collectionSelection, link, mode, focus)
        } else {
            console.error('this should not happen!')
        }

        this.simulation.nodes([...nodes, ...collections])
        this.simulation.force("link").links(links)

        if (
            nodes.length !== (this.prevProps && this.prevProps.nodes.length) ||
            collections.length !== (this.prevProps && this.prevProps.collections.length) ||
            links.length !== (this.prevProps && this.prevProps.links.length))
        {
            this.restartSimulation()
        }

        // nescessary because not using react here
        this.prevProps = { nodes, collections, links }
    }

    restartSimulation() {
        // TODO: do two zooms, an initial "guess" zoom and another for accuracy - 2017-06-07
        // this.zoomed = false;
        console.log('calling restartSimulation...');
        this.simulation.alpha(0.8).restart()
    }

    stopSimulation() {
        console.log('stopping simulation...');
        this.simulation.stop()
    }

    componentDidMount() {
        const {
            isLoading,
            graphType,
            loadNode,
            removeEdge,
            connectNodes,
            connectCollections,
            activeCollection,
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

        // TODO: collectionId should be not be static like this - 2017-05-21
        this.collectionDetailEvents = createCollectionDetailEvents.call(this, this.simulation, {
            history: this.props.history,
            removeEdge,
            connectNodes,
            fetchNodeL1: this.props.fetchNodeL1,
            setActiveNode: this.props.setActiveNode,
            updateNode: this.props.updateNode,
            removeNode: this.props.removeNode,
            removeAbstraction: this.props.removeAbstraction,
            toggleCollapse: this.props.toggleCollapse,
            moveToAbstraction: this.props.moveToAbstraction,
        })

        //TODO: set to true on initial tick
        this.zoomed = false

        const ticked = (selection) => {
            if (!this.zoomed && this.simulation.alpha() < 0.6) {
                this.zoomed = true
                this.zoom.zoomFit()
            }

            selection.selectAll('.nodeSelection')
                .call(transformNode);
            selection.selectAll('.collectionSelection')
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
        if (nextProps.nodes !== this.props.nodes || nextProps.links !== this.props.links) {
            this.update(nextProps)
        }

        return false
    }

    render() {
        // TODO: should be set somewhere up high so shouldComponentUpdate can return false - 2017-06-21
        // const className = 'svg-content' + (this.props.editMode ? ' editMode' : '')

        return (
            <div>
                <ZoomButtons
                    zoomIn={() => this.zoom.zoomIn()}
                    zoomOut={() => this.zoom.zoomOut()}
                    zoomFit={() => this.zoom.zoomFit()}
                />
                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="svg-content"
                    ref="graph"
                >
                    <g ref="container" />
                </svg>
            </div>
        )
    }
}

export default withRouter(NodeGraph)
