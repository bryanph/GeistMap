
import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

import { scaleLinear } from 'd3-scale'
import { drag as d3Drag } from 'd3-drag'
import { select as d3Select } from 'd3-selection'
import { event as currentEvent } from 'd3-selection';
import './styles.scss'

import { browserHistory } from 'react-router-dom'

import createZoom from '../../graph/zoom'
import createSimulation, { transformNode, transformLink } from '../../graph/simulation'
import createDrag from '../../graph/drag'
import { arrowHead } from '../../graph/svgdefs.js'
import { MIN_NODE_RADIUS, MAX_NODE_RADIUS, NODE_RADIUS, WIDTH, HEIGHT } from '../../graph/constants'
import {colorActiveNode } from '../../graph/util'
import { withRouter } from 'react-router-dom'

import classNames from 'classnames'
const uuidV4 = require('uuid/v4');


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
            .text((d) => getLabelText(d.name));

        // remove enter-selection flag for rxjs...
        // selection.classed('enter-selection', false)

        return selection

    }
}

const updateNode = function(selection) {
    selection.select('text').text(d => {
        return getLabelText(d.name)
    })

    return selection
}

const createEnterLink = function(actions) {
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


const createEnterCollection = function(actions: { click: Function }) {
    /*
     * HOF for enterNode
    */
    return (selection, editMode) => {
        selection
            .attr("class", "node subject-node")
            // for later reference from data
            .attr('id', (d) => {
                return `node-${d.id}`
            }) 

        selection.on('click', actions.click)

        selection
            .append('circle')
            .attr("r", (d) => d.radius)
            .attr("x", -8)
            .attr("y", -8)
            // .style("fill", colorNode)

        selection.append('text')
        // TODO: make it fit the circle with radius - 2017-06-05
        // .attr("dx", (d) => -d.radius)
        // .attr("dy", (d) => -d.radius)
        // .attr("width", (d) => d.radius)
        // .attr("height", (d) => d.radius)
            .text((d) => getLabelText(d.name))
            .on('click', (d) => {
                currentEvent.stopPropagation()
                actions.setActiveCollection(d.id)
                console.log('called textClick');
            })
            

        return selection

    }
}

const createUpdateCollection = function(actions) {

    return (selection, data, editMode, editFocus) => {
        const nodeClasses = classNames("node", "subject-node", {
            editMode
        })

        selection
            .attr("class", "node subject-node")

        if (editMode) {
            selection.on('click', function(d) {
                actions.zoomToNode(d3Select(this), d)
            })
        } else {
            selection.on('click', actions.click)
        }


        // dist from center to the inscribed square
        console.log(data.radius);
        const sqDist = data.radius * (Math.sqrt(2) / 2)
        const sqLen = data.radius * Math.sqrt(2)

        const fontSize = 20 // in px
        const minLineHeight = 20 // in px (this takes viewBox in account)
        // const lineHeight = Math.max(minLineHeight, 2*data.radius / 3)
        const lineHeight = 20

        // the number of lines to render
        const numLines = Math.floor(sqLen / lineHeight)

        let text = selection.select('text')
            .attr('x', -sqDist)
            .attr('y', -sqDist)
            .attr('width', sqLen)
            .attr('height', sqLen)
            .style('font-size', function (d) {
                // console.log('text length', this.getComputedTextLength());
                return fontSize
            })
            // .attr('dy', '1em')
            // .style("font-size", (d) => d.radius / 3)
            // .text((d) => getLabelText(d.name));

        const words = data.name.split(/\s+/).reverse()
        let line = []
        let lineNumber = 0
        let word = null

        let curTspan = text.text(null)
            .append('tspan')
            .attr('x', 0)
            .attr('y', 0)
            .attr("dy", lineHeight / 2)

        while (word = words.pop()) {
            line.push(word)
            curTspan.text(line.join(" "))
            console.log(curTspan.node().getComputedTextLength(), sqLen)
            if (curTspan.node().getComputedTextLength() > sqLen) {
                // move to a new line
                line.pop()
                curTspan.text(line.join(" "))
                line = [ word ]
                curTspan = text
                    .append('tspan')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr("dy", lineHeight/2 + ++lineNumber * lineHeight)
                    .text(word)
            }
        }

        // now center text vertically
        console.log(text.node().getBBox());
        const computedTextHeight = text.node().getBBox().height
        const adjustedHeight = computedTextHeight/2
        // const adjustedHeight = (lineNumber + 1) * lineHeight
        console.log('text height', adjustedHeight);
        text.attr('transform', `translate(0, ${-adjustedHeight})`)
        // text.selectAll('tspan')
        //     .attr('y', function(d) {
        //         return -adjustedHeight
        //     })


        selection.select('circle')
            .attr("r", (d) => d.radius)

        // TODO: is there a way to avoid calling this? - 2017-06-07
        // with react this would be a lot simpler.
        selection.select('.editNodeButton').remove()

        if (editMode) {
            // this node is currently being edited
            if (editFocus.id === data.id) {
                selection.append('foreignObject')
                    .attr('x', -sqDist)
                    .attr('y', -sqDist)
                    .attr('width', sqLen)
                    .attr('height', sqLen)
                    .append('xhtml:body')
                    .append('input')
            }
            
            const group = selection.append('g')
                .attr('class', 'editNodeButton')
            // place at bottom of circle with a little padding (an extra 0.05 here)
                .attr('transform', (d) => `translate(0, ${d.radius * Math.sqrt(3)/2 - (d.radius * 0.45)})`)
                .style('font-size', (d) => d.radius / 4.5)
                .on('click', (d) => actions.editNode(d, selection))

            group.append('rect')
                .attr('width', (d) => d.radius * 0.4)
                .attr('height', (d) => d.radius * 0.4)
                .attr('rx', 5)
                .attr('ry', 5)
                .attr('x', (d) => -(d.radius * 0.2)) // half of width
            // .attr('y', (d) => -(d.radius * 0.2))

            const text = group.append('text')
                .attr("dy", "1em")

            text.append('tspan')
                .attr('class', 'editNodeButton-icon')
                .text((d) => '\uF040')

            // text.append('tspan')
            //     .text('edit')
            //     .attr('dx', '.3em')
        }

        return selection
    }
}

const createEnterCollectionLink = function(actions) {
    return (selection, editMode) => {
        return selection
            .append("path")
            .attr('id', (d) => `link-${d.id}`) // for later reference from data
            .attr("class", "node-link collection-link")
            .classed("editMode", editMode)
            // .attr("marker-end", "url(#Triangle)")
            // .on('dblclick', actions.doubleClick)
        // .append("path")
        // .attr('id', (d) => `link-${d.id}`) // for later reference from data
        // .attr('fill', (d) => lightAccentColor)
        // .attr("class", "node-link")
        // .on('dblclick', events.linkDoubleClick)
        // .attr("marker-mid", "url(#Triangle)")
    }
}

const createInboxEvents = function(simulation, actions) {
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


const createCollectionOverviewEvents = function(simulation, actions) {
    /*
     * in first call creates the drag() object
     * Afterwards, can be called with node an link DOM nodes
     */
    const onCollectionClick = (d) => {
        actions.history.push(`/app/collections/${d.id}/nodes`)
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
    const updateCollection = createUpdateCollection({
        click: onCollectionClick,
        zoomToNode: actions.zoomToNode,
        editNode: function(d, selection) {
            currentEvent.stopPropagation()

            // stop the simulation to fix the node positions
            actions.stopSimulation()
            actions.zoomToNode(selection, d)
            actions.setActiveCollection(d.id)
        }
    })

    const enterCollectionLink = createEnterCollectionLink({
        // doubleClick: (d) => actions.removeEdge(d.id)
    })

    // const updateLink = createUpdateCollectionLink({

    // })


    function createEnterAddCollection(actions) {
        /*
         * HOF for enterNode
         */

        const radius = 10

        return (selection) => {
            selection
                .attr("class", "node addCollection-node")

            selection.on('click', actions.onClick)

            selection
                .append('circle')
            // .attr("r", (d) => d.radius)
                .attr("r", radius)
                .attr("x", -8)
                .attr("y", -8)

            selection.append('text')
                .attr("dy", ".35em")
                .text((d) => '\uF067');

            return selection
        }
    }

    function createEnterAddCollectionLink(actions) {
        return (selection) => {
            return selection
                .append("path")
                .attr("class", "node-link addCollection-link")
                // .on('dblclick', actions.doubleClick)
        }
    }

    const enterAddCollection = createEnterAddCollection({
        onClick: (d) => {
            actions.addCollection(d)
        }
    })
    const enterAddCollectionLink = createEnterAddCollectionLink({

    })

    return (node, link, editMode, editFocus) => {
        // TODO: join all nodes on the same class to allow for enter-update-exit animations - 2017-06-07
        
        // // EXIT selection
        // addCollectionNode.exit().remove()
        // // ENTER selection
        // addCollectionNode.enter().append('g').call(enterAddCollection)
        // // ENTER + UPDATE selection
        //     // .merge(addCollectionNode).call(updateCollection)

        // // EXIT selection
        // addCollectionLink.exit().remove()
        // // ENTER selection
        // addCollectionLink.enter().insert('g', ":first-child").call(enterAddCollectionLink)
        // // ENTER + UPDATE selection
        // // .merge(addCollectionLink).call(updateLink)

        // EXIT selection
        node.exit().remove()
        // ENTER selection
        node.enter().append('g').each(function(d) {
            const s = d3Select(this)

            if (d.type === 'addCollection') {
                return enterAddCollection(s)
            }
            else {
                return enterCollection(s, editMode).call(collectionDrag)
            }
        })
        // node.enter().append('g').call((s) => enterCollection(s, editMode)).call(collectionDrag)
        // ENTER + UPDATE selection
            .merge(node).each(function(d) {
                const s = d3Select(this)

                if (d.type === 'addCollection') {
                    // return updateCollection(s)
                }
                else {
                    // TODO: only set collectionDrag if hasn't been set before - 2017-06-07
                    return updateCollection(s, d, editMode, editFocus).call(collectionDrag) 
                }
            })
            // .merge(node).call((s) => updateCollection(s, editMode))
        
        // EXIT selection
        link.exit().remove()
        // ENTER selection
        link.enter().insert('g', ":first-child").each(function(d) {
            const s = d3Select(this)

            if (d.type === 'addCollection') {
                return enterAddCollectionLink(s)
            }
            else {
                return enterCollectionLink(s, editMode)
            }
        })
        // link.enter().insert('g', ":first-child").call(enterCollectionLink)
        // ENTER + UPDATE selection
        // .merge(link).call(updateLink)
    }
}

const createCollectionDetailEvents = function(simulation, collectionId, actions) {
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
            editMode, // is this graph in edit mode?
            editFocus, // is a single node being edited?
        } = nextProps

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

        let nodeById = {}

        // TODO: this only applies to CollectionOverview
        const maxNodeCount = (_.maxBy(nodes, (d) => d.count) || {}).count || 0
        const radiusScale = scaleLinear().domain([0, maxNodeCount]).range([MIN_NODE_RADIUS, MAX_NODE_RADIUS])

        // set extra properties here
        nodes.forEach(node => {
            if (node.type !== 'addCollection') {
                node.radius = radiusScale(node.count || 0)

                if (node.isRootCollection) {
                    node.radius = MAX_NODE_RADIUS
                    node.fx = WIDTH / 2
                    node.fy = HEIGHT / 2
                }
            }

            nodeById[node.id] = node
        })

        links.forEach(link => {
            link.source = nodeById[link.start]
            link.target = nodeById[link.end]
        })

        // set data
        var node = this.container.selectAll('.node')
            .data(nodes, node => node.id)

        var link = this.container.selectAll('.node-link')
            .data(links, link => link.id)

        // enter-update-exit cycle depending on type of graph
        if (graphType === 'inbox') {
            this.inboxEvents(node, link)
        } else if (graphType === 'explore') {
            this.exploreEvents(node, link)
        } else if (graphType === 'collectionOverview') {
            this.collectionOverviewEvents(node, link, editMode, editFocus)
        } else if (graphType === 'collectionDetail') {
            this.collectionDetailEvents(node, link)
        } else {
            console.error('this should not happen!')
        }

        this.simulation.nodes(nodes)
        this.simulation.force("link").links(links)

        // TODO: instead,, just compare the reference
        this.restartSimulation()

        // if (nodes.length !== this.props.nodes.length || links.length !== this.props.links.length) {
        //     this.restartSimulation()
        // }

        // if (nextProps.selectedId) {
        //     colorActiveNode(d3Select(`#node-${nextProps.selectedId}`))
        // }
    }

    restartSimulation() {
        // TODO: do two zooms, an initial "guess" zoom and another for accuracy - 2017-06-07
        console.log('restarting simulation...');
        this.zoomed = false;
        this.simulation.alpha(0.8).restart()
    }

    stopSimulation() {
        console.log('stopping simulation...');
        this.simulation.stop()
    }

    componentDidMount() {
        const { loadNode, removeEdge, connectNodes, connectCollections, removeCollectionEdge, collectionId } = this.props

        this.graph = d3Select(ReactDOM.findDOMNode(this.refs.graph));
        this.container = d3Select(ReactDOM.findDOMNode(this.refs.container));
        this.container.append('defs').call(arrowHead)

        this.simulation = createSimulation(WIDTH, HEIGHT)
        this.zoom = createZoom(this.graph, this.container, WIDTH, HEIGHT)

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
            setActiveCollection: this.props.setActiveCollection,
            addCollection: this.props.addCollection,
            zoomToNode: this.zoom.zoomToNode,
            restartSimulation: this.restartSimulation,
            stopSimulation: this.stopSimulation,
        })
        // TODO: collectionId should be not be static like this - 2017-05-21
        this.collectionDetailEvents = createCollectionDetailEvents.call(this, this.simulation, collectionId, {
            history: this.props.history,
            removeEdge,
            connectNodes,
        })

        //TODO: set to true on initial tick
        this.zoomed = false
        const ticked = (selection) => {
            if (!this.zoomed && this.simulation.alpha() < 0.6) {
                this.zoomed = true
                this.zoom.zoomFit(0.95, 1000)
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
            this.container.call(ticked);
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
                    ref='graph'
                >
                    <g ref='container' />
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
