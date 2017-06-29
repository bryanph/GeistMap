import _ from 'lodash'
import React from 'react'
import { withRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import { scaleLinear } from 'd3-scale'
import { drag as d3Drag } from 'd3-drag'
import { select as d3Select } from 'd3-selection'
import { event as currentEvent, mouse as currentMouse } from 'd3-selection';

import { browserHistory } from 'react-router-dom'

import createZoom from '../../graph/zoom'
import { createNodeSimulation, transformNode, transformLink } from './simulation'
import createDrag from './drag'
import { arrowHead } from '../../graph/svgdefs.js'
import { MIN_NODE_RADIUS, MAX_NODE_RADIUS, NODE_RADIUS, WIDTH, HEIGHT } from '../../graph/constants'
import {colorActiveNode } from '../../graph/util'

import ZoomButtons from '../ZoomButtons'

import './styles.scss'

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

import { colorNode } from '../../graph/util'

const createEnterNode = function(actions: { click: Function }) {
    /*
     * HOF for enterNode
    */
    return (selection, click) => {
        selection
            .attr("class", "node")
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

        // TODO: split into lines when text gets too big - 2017-06-22
        selection.append('text')
            .attr("dy", NODE_RADIUS*2 + 1)
            .text((d) => getLabelText(d.name));

        return selection

    }
}

const createUpdateNode = (actions) => (selection, mode, focus) => {
    selection.select('text').text(d => {
        return getLabelText(d.name)
    })

    selection.select('.editMode').remove()

    // insert an editable text field at the bottom
    if (mode === 'focus') {
        selection.on('click', (d) => {
            // go to NodeExplore, which will transition node to center and perform the fetching and filtering
            actions.history.push(`/app/nodes/${d.id}`)
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
                .attr('y', (d) => NODE_RADIUS + 1)
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
    else if (mode === 'view') {
        // make click go to editor
        selection.on('click', actions.onNodeClick)
    }

    return selection
}

const createEnterLink = function(actions) {
    return (selection) => {
        return selection
            .append("path")
            .attr('id', (d) => `link-${d.id}`) // for later reference from data
            .attr("class", "link node-link")
            .attr("marker-end", "url(#Triangle)")
            .on('dblclick', actions.doubleClick)
        // .append("path")
        // .attr('id', (d) => `link-${d.id}`) // for later reference from data
        // .attr('fill', (d) => lightAccentColor)
        // .attr("class", "link node-link")
        // .on('dblclick', events.linkDoubleClick)
        // .attr("marker-mid", "url(#Triangle)")
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
        click: onNodeClick,
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
        link.enter().insert('g', ":first-child").call(enterLink)
        // ENTER + UPDATE selection
        // .merge(link).call(updateLink)
    }
}

const createCollectionDetailEvents = function(simulation, collection, actions) {
    /*
     * in first call creates the drag() object
     * Afterwards, can be called with node an link DOM nodes
     */
    const onNodeClick = function(d) {
        currentEvent.preventDefault()

        actions.history.push(`/app/collections/${collection.id}/nodes/${d.id}/edit`)
    }

    const onConnect = (from, to) => {
        // TODO: make sure this change is represented in the graph
        return actions.connectNodes(from, to)
    }

    const drag = createDrag(simulation)({ 
        connect: onConnect,
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
        link.enter().insert('g', ":first-child").call(enterLink)
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
    }

    update(nextProps) {
        /*
         * Go through the enter,update,exit cycle based on the route
        */
        let { 
            nodes,
            links,
            graphType,
            mode, // mode of the graph
            focus, // is a single node being edited?
            activeNode, // if a single node is focused
            activeCollection,
        } = nextProps

        let nodeById = {}

        // TODO: this only applies to CollectionOverview
        // const maxNodeCount = (_.maxBy(nodes, (d) => d.count) || {}).count || 0
        // const radiusScale = scaleLinear().domain([0, maxNodeCount]).range([MIN_NODE_RADIUS, MAX_NODE_RADIUS])

        // make sure there are no duplicates in nodes, edges
        // TODO: shouldn't be nescessary - 2017-06-21
        nodes = _.uniqBy(nodes, (node) => node.id)
        links = _.uniqBy(links, (link) => link.id)

        // set extra properties here
        nodes.forEach(node => {
            nodeById[node.id] = node
            // only when coming from collection
            if (graphType === 'collection' && activeNode) {
                // TODO: fix collection nodes, zoom on node, center gravity on node - 2017-06-29
                if (node.x && node.y) {
                    node.fx = node.x
                    node.fy = node.y
                }
            } else {
                node.fx = null
                node.fy = null
            }
        })

        links.forEach(link => {
            link.source = nodeById[link.start]
            link.target = nodeById[link.end]
        })



        // set data
        var node = this.container.selectAll('.node')
            .data(nodes, node => node.id)

        var link = this.container.selectAll('.link')
            .data(links, link => link.id)

        // enter-update-exit cycle depending on type of graph
        if (graphType === 'node') {
            this.exploreEvents(node, link, mode, focus)
        } else if (graphType === 'collection') {
            this.collectionDetailEvents(node, link, mode, focus)
        } else {
            console.error('this should not happen!')
        }

        this.simulation.nodes(nodes)
        this.simulation.force("link").links(links)

        if (nodes.length !== (this.prevProps && this.prevProps.nodes.length) || links.length !== (this.prevProps && this.prevProps.links.length)) {
            // if (activeNode) {
            //     this.simulation.stop()
            // }
            // else {
            //     this.restartSimulation()
            // }
            this.restartSimulation()
        }

        // nescessary because not using react here
        this.prevProps = { nodes, links }
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

    componentWillUnmount() {
        console.log("called componentWillUnmount");
    }

    componentDidMount() {
        const { graphType, loadNode, removeEdge, connectNodes, connectCollections, collection } = this.props

        console.log('called componentDidMount');

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
        })
        // TODO: collectionId should be not be static like this - 2017-05-21
        this.collectionDetailEvents = createCollectionDetailEvents.call(this, this.simulation, collection, {
            history: this.props.history,
            removeEdge,
            connectNodes,
            setActiveNode: this.props.setActiveNode,
            updateNode: this.props.updateNode,
        })

        //TODO: set to true on initial tick
        this.zoomed = false

        const ticked = (selection) => {
            if (!this.zoomed && this.simulation.alpha() < 0.6) {
                this.zoomed = true
                this.zoom.zoomFit()
            }

            selection.selectAll('.node')
                .call(transformNode);
            selection.selectAll('.link')
                .call(transformLink);
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
            console.log("calling update");
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
