

import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
import { withRouter } from 'react-router-dom'
import classNames from 'classnames'
import { scaleLinear } from 'd3-scale'
import { drag as d3Drag } from 'd3-drag'
import { select as d3Select } from 'd3-selection'
import { event as currentEvent } from 'd3-selection';
import './styles.scss'

import { browserHistory } from 'react-router-dom'

import createZoom from '../../graph/zoom'
import { createNodeSimulation, createCollectionSimulation, transformNode, transformLink } from '../../graph/simulation'
import createDrag from '../../graph/drag'
import { arrowHead } from '../../graph/svgdefs.js'
import { MIN_NODE_RADIUS, MAX_NODE_RADIUS, NODE_RADIUS, WIDTH, HEIGHT } from '../../graph/constants'
import {colorActiveNode } from '../../graph/util'

import ZoomButtons from '../ZoomButtons'



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
            .attr("class", "subject-node-circle")
            .attr("r", (d) => d.radius)
            .attr("x", -8)
            .attr("y", -8)
        // .style("fill", colorNode)

        selection.append('text')
            .text((d) => getLabelText(d.name))
        // .on('click', (d) => {
        //     currentEvent.stopPropagation()
        //     actions.setActiveCollection(d.id)
        //     console.log('called textClick');
        // })


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
                actions.stopSimulation()
                actions.zoomToNode(d3Select(this), d)
            })
        } else {
            selection.on('click', actions.click)
        }


        // dist from center to the inscribed square
        const sqDist = data.radius * (Math.sqrt(2) / 2)
        const sqLen = data.radius * Math.sqrt(2)

        const fontSize = data.radius / 3 // in px
        const minLineHeight = 20 // in px (this takes viewBox in account)
        const lineHeight = fontSize

        // the number of lines to render
        const numLines = Math.floor(sqLen / lineHeight)

        let text = selection.select('text')
            .attr('x', -sqDist)
            .attr('y', -sqDist)
            .attr('width', sqLen)
            .attr('height', sqLen)
            .style('font-size', fontSize)
        // .attr('dy', '1em')
        // .style("font-size", (d) => d.radius / 3)
        // .text((d) => getLabelText(d.name));

        if (!data.name) {
            data.name = ""
        }
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
        const textBBox = text.node().getBBox()
        const computedTextHeight = textBBox.height
        const adjustedHeight = computedTextHeight/2 - lineHeight/2
        text.attr('transform', `translate(0, ${-adjustedHeight})`)


        selection.select('circle')
            .attr("r", (d) => d.radius)
            .attr("class", "subject-node-circle")

        // TODO: is there a way to avoid calling this? - 2017-06-07
        // with react this would be a lot simpler.
        selection.select('.editMode').remove()

        if (editMode) {
            const editMode = selection.append('g')
                .attr('class', 'editMode')
                .style('font-size', (d) => d.radius / 6)

            if (editFocus.id === data.id) {
                editMode.append('circle')
                    .attr('r', data.radius)


                const div = editMode.append('foreignObject')
                    .attr('x', -sqDist)
                    .attr('y', -sqDist)
                    .attr('width', sqLen)
                    .attr('height', sqLen)
                    .append('xhtml:div')

                div.attr("style", `width: ${sqLen}px; height: ${sqLen}px;`)

                const textarea = div.append('textarea')
                    .attr('maxLength', 50)
                    .attr('autofocus', true)
                    .text(data.name)
                // .style("height", sqLen)
            }

            const buttonHeight = data.radius * 0.3

            const group = editMode.append('g')
                .attr('class', 'editNodeButton')
                .classed('editNodeButton-active', editFocus.id === data.id)
                .attr('transform', (d) => `translate(0, ${d.radius - buttonHeight / 1.4})`)
            // .style('font-size', (d) => d.radius / 4.5)
                .on('click', (d) => {
                    if (editFocus.id === data.id) {
                        const value = editMode.select('textarea').node().value

                        console.log('calling zoomfit!');
                        actions.zoomFit()

                        if (data.isNew) {
                            actions.createCollection(data.id, { name: value })
                                .then(() => actions.connectCollections(data.id, data.parentId, data.edgeId))
                            actions.setActiveCollection(null)
                        }
                        // save the node, we changed it
                        return actions.updateCollection(data.id, { name: value })
                            .then(() => actions.setActiveCollection(null))

                    }
                    // set node in edit mode
                    actions.editNode(d, selection)
                })

            group.append('circle')
                .attr('r', buttonHeight / 2)
            // .attr('x', (d) => -(buttonHeight / 2)) // half of width
            // .attr('y', -buttonHeight/4)

            // .attr('y', (d) => -(d.radius * 0.2))

            const text = group.append('text')
            // .attr("dy", "1em")

            text.append('tspan')
                .attr('class', 'editNodeButton-icon')
                .text((d) => {
                    if (editFocus.id === data.id) {
                        return '\uF00C'
                    }
                    return '\uF040'
                })
        }

        return selection
    }
}

const createEnterCollectionLink = function(actions) {
    return (selection, editMode) => {
        return selection
            .append("path")
            .attr('id', (d) => `link-${d.id}`) // for later reference from data
            .attr("class", "node-link subject-link")
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
        zoomFit: actions.zoomFit,
        createCollection: actions.createCollection,
        updateCollection: actions.updateCollection,
        setActiveCollection: actions.setActiveCollection,
        connectCollections: actions.connectCollections,
        stopSimulation: actions.stopSimulation,
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
                .attr("class", "node addSubject-node")

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
                .attr("class", "node-link addSubject-link")
            // .on('dblclick', actions.doubleClick)
        }
    }

    const enterAddCollection = createEnterAddCollection({
        onClick: function(d) {
            actions.addCollection(d)
            setTimeout(() => {
                actions.stopSimulation()
                actions.zoomToNode(d3Select(this), d)
            }, 100)
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


class SubjectGraph extends React.Component {
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

        let nodeById = {}

        // TODO: this only applies to CollectionOverview
        const maxNodeCount = (_.maxBy(nodes, (d) => d.count) || {}).count || 0
        const radiusScale = scaleLinear().domain([0, maxNodeCount]).range([MIN_NODE_RADIUS, MAX_NODE_RADIUS])

        // set extra properties here
        nodes.forEach(node => {
            node.radius = radiusScale(node.count || 0)

            if (node.isRootCollection) {
                node.radius = MAX_NODE_RADIUS
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
        var node = this.container.selectAll('.node')
            .data(nodes, node => node.id)

        var link = this.container.selectAll('.node-link')
            .data(links, link => link.id)

        // enter-update-exit cycle depending on type of graph
        this.collectionOverviewEvents(node, link, editMode, editFocus)

        this.simulation.nodes(nodes)
        this.simulation.force("link").links(links)

        if (nodes !== this.props.nodes || links !== this.props.links) {
            this.restartSimulation()
        }
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
        const { graphType, loadNode, removeEdge, connectNodes, connectCollections, removeCollectionEdge, collectionId } = this.props

        this.graph = d3Select(ReactDOM.findDOMNode(this.refs.graph));
        this.container = d3Select(ReactDOM.findDOMNode(this.refs.container));
        this.container.append('defs').call(arrowHead)

        this.simulation = createCollectionSimulation(WIDTH, HEIGHT)

        this.zoom = createZoom(this.graph, this.container, WIDTH, HEIGHT)

        this.collectionOverviewEvents = createCollectionOverviewEvents.call(this, this.simulation, {
            history: this.props.history,
            removeEdge: removeCollectionEdge,
            connectCollections: this.props.connectCollections,
            setActiveCollection: this.props.setActiveCollection,
            createCollection: this.props.createCollection,
            updateCollection: this.props.updateCollection,
            addCollection: this.props.addCollection,
            zoomToNode: this.zoom.zoomToNode,
            zoomFit: this.zoom.zoomFit,
            restartSimulation: this.restartSimulation,
            stopSimulation: this.stopSimulation,
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
            <div>
                <ZoomButtons
                    zoomIn={() => this.zoom.zoomIn()}
                    zoomOut={() => his.zoom.zoomOut()}
                    zoomFit={() => this.zoom.zoomFit()}
                />
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

export default withRouter(SubjectGraph)
