
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
import { NODE_RADIUS, WIDTH, HEIGHT } from '../../graph/constants'
import {colorActiveNode } from '../../graph/util'
import { withRouter } from 'react-router-dom'

import classNames from 'classnames'


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
            .on('click', () => {
                currentEvent.stopPropagation()
                console.log('called textClick');
            })
            

        return selection

    }
}

const createUpdateCollection = function(actions) {

    return (selection, editMode) => {
        const nodeClasses = classNames("node", "subject-node", {
            editMode
        })

        selection
            .attr("class", "node subject-node")

        if (editMode) {
            selection.on('click', null)
        } else {
            selection.on('click', actions.click)
        }


        // TODO: fit text to circle- 2017-06-05
        selection.select('text')
            .style("font-size", (d) => d.radius / 3)
        // .style("font-size", (d) => {
        //     const textWidth = this.getComputedTextLength()

        //     if (textWidth > d.radius*2) {
        //         return 
        //     }
        // }
            .text((d) => getLabelText(d.name));

        selection.select('circle')
            .attr("r", (d) => d.radius)

        if (editMode) {
            // selection.append('foreignObject')
            //     .attr('width', 100)
            //     .attr('height', 150)
            //     .append('xhtml:body')
            //     .append('input')

            const group = selection.append('g')
                .attr('class', 'editNodeButton')
            // place at bottom of circle with a little padding (an extra 0.05 here)
                .attr('transform', (d) => `translate(0, ${d.radius * Math.sqrt(3)/2 - (d.radius * 0.45)})`)
                .style('font-size', (d) => d.radius / 4.5)
                .on('click', actions.editNode)

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
        } else {
            selection.select('.editNodeButton').remove()
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
            .attr("marker-end", "url(#Triangle)")
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
        editNode: (d) => {
            console.log('called edit...');
            currentEvent.stopPropagation()
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
                .attr("class", "addCollection-node")

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
                .attr("class", "addCollection-link")
                // .on('dblclick', actions.doubleClick)
        }
    }

    const enterAddCollection = createEnterAddCollection({
        onClick: (d) => {
            console.log("transform this node into an actual editable node like all the others");
        }
    })
    const enterAddCollectionLink = createEnterAddCollectionLink({

    })

    return (node, link, editMode, nodes, links) => {

        let addCollectionNodes = []
        let addCollectionLinks = []

        if (editMode) {
            // add an "add node" button node for every collection
            nodes.forEach((node, index) => {
                const id = `addCollection-${index}`
                const addCollectionNode = {
                    id,
                    type: 'addCollection'
                }

                addCollectionNodes.push(addCollectionNode)
                addCollectionLinks.push({
                    type: 'addCollection',
                    source: node.id,
                    target: id
                })
            })

        }


        const addCollectionNode = this.d3Graph.selectAll('.addCollection-node')
            .data(addCollectionNodes)

        const addCollectionLink = this.d3Graph.selectAll('.addCollection-link')
            .data(addCollectionLinks)

        // EXIT selection
        addCollectionNode.exit().remove()
        // ENTER selection
        addCollectionNode.enter().append('g').call(enterAddCollection)
        // ENTER + UPDATE selection
            // .merge(addCollectionNode).call(updateCollection)

        // EXIT selection
        addCollectionLink.exit().remove()
        // ENTER selection
        addCollectionLink.enter().insert('g', ":first-child").call(enterAddCollectionLink)
        // ENTER + UPDATE selection
        // .merge(addCollectionLink).call(updateLink)



        // EXIT selection
        node.exit().remove()
        // ENTER selection
        node.enter().append('g').call((s) => enterCollection(s, editMode)).call(collectionDrag)
        // ENTER + UPDATE selection
            .merge(node).call((s) => updateCollection(s, editMode))
        
        // EXIT selection
        link.exit().remove()
        // ENTER selection
        link.enter().insert('g', ":first-child").call(enterCollectionLink)
        // ENTER + UPDATE selection
        // .merge(link).call(updateLink)


        return {
            addCollectionNodes,
            addCollectionLinks
        }
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

        let nodeById = {}

        const minRadius = 30
        const maxRadius = 80

        // TODO: this only applies to CollectionOverview
        const maxNodeCount = (_.maxBy(nodes, (d) => d.count) || {}).count || 0
        const radiusScale = scaleLinear().domain([0, maxNodeCount]).range([minRadius, maxRadius])

        // set extra properties here
        nodes.forEach(node => {
            node.radius = radiusScale(node.count || 0)

            if (node.isRootCollection) {
                node.radius = maxRadius
                node.fx = WIDTH / 2
                node.fy = HEIGHT / 2
            }

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
            let { 
                addCollectionNodes,
                addCollectionLinks
            } = this.collectionOverviewEvents(node, link, nextProps.editMode, nodes, links)

            nodes.push(...addCollectionNodes)
            links.push(...addCollectionLinks)

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
        this.zoomed = false
        const ticked = (selection) => {
            if (!this.zoomed && this.simulation.alpha() < 0.75) {
                this.zoomed = true
                this.zoom(0.95, 1000)
            }

            selection.selectAll('.node')
                .call(transformNode);
            selection.selectAll('.node-link')
                .call(transformLink);

            selection.selectAll('.addCollection-node')
                .call(transformNode);
            selection.selectAll('.addCollection-link')
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
