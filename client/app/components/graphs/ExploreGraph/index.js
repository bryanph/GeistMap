
import _ from 'lodash'
import React from 'react'
import { withRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import { drag as d3Drag } from 'd3-drag'
import { select as d3Select } from 'd3-selection'
import { event as currentEvent, mouse as currentMouse } from 'd3-selection';
import { scaleLinear } from 'd3-scale'
import { tree as d3Tree, hierarchy as d3Hierarchy } from 'd3-hierarchy'

import {
    forceSimulation,
    forceX,
    forceY,
    forceManyBody,
    forceLink,
    forceCenter
} from 'd3-force'

import createZoom from '../zoom'
import {
    MIN_NODE_RADIUS,
    MAX_NODE_RADIUS,
    NODE_RADIUS,
    WIDTH,
    HEIGHT,
} from '../constants'

import ZoomButtons from '../ZoomButtons'

import HierarchyGraph from '../HierarchyGraph'
import {
    createInnerDrag
} from './drag'

import './styles.scss'

class NodeOutside extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const selection = d3Select(`#node-${this.props.node.id}`)
        this.props.drag(selection)
    }

    render() {
        const { node } = this.props
        const transform = `translate(${node.y}, ${node.x})`;

        return (
            <g id={`node-${node.id}`} className="node node-outside" transform={transform}>
                <circle
                    className="nodeCircle"
                    r={NODE_RADIUS}
                    fill={ node.children ? "lightsteelblue" : "#fff" }
                />
                <text
                    className="nodeText"
                    x={node.children ? -10 : 10}
                    textAnchor={ node.children ? "end" : "start" }
                >{node.name}</text>
            </g>
        )
    }
}

class LinkOutside extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { link } = this.props

        const startingPoint = `M ${link.source.y}, ${link.source.x}`

        const path = link.source.depth === link.target.depth ? 
            [ startingPoint,
                'A',
                (link.source.x - link.target.x) / 2,
                // 50,
                (link.source.x - link.target.x) / 2,
                0,
                0,
                link.source.x < link.target.x ? 1 : 0,
                link.target.y,
                link.target.x
            ].join(' ')
            :
            // [
            //     startingPoint,
            //     'L',
            //     link.target.y,
            //     link.target.x
            // ].join(' ')
            [
                startingPoint,
                "C",
                (link.source.y + link.target.y) / 2,
                link.source.x,
                (link.source.y + link.target.y) / 2,
                link.target.x,
                link.target.y,
                link.target.x
            ].join(' ')

        return (
            <path 
                className="link"
                d={ path }
            />
        )
    }
}

class ManipulationLayer extends React.PureComponent {
    constructor(props) {
        super(props)

        this.zoomed = this.zoomed.bind(this)

        this.state = {
            containerTransform: `translate(${WIDTH/2}, ${HEIGHT/2})`
        }
    }

    componentDidMount() {
        const domNode = ReactDOM.findDOMNode(this.refs.graph)
        this.graph = d3Select(domNode);
        this.container = d3Select(ReactDOM.findDOMNode(this.refs.container));

        this.zoom = createZoom(this.graph, this.container, WIDTH, HEIGHT, this.zoomed)

        // this.zoom.zoomFit()
    }

    componentDidUpdate() {
        // this.zoom.zoomFit()
    }

    zoomed(transform) {
        this.setState({
            containerTransform: transform
        })
    }

    render() {
        return (
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
                className="svg-content explore-graph"
                ref="graph"
            >
                <g ref="container" transform={this.state.containerTransform}>
                    { this.props.children }
                </g>
            </svg>
        )
    }
}

const iterations = 500;
const edgeStrength = 0.6;
const distanceMax = Infinity;

class ExploreGraph extends React.Component {

    constructor(props) {
        super(props)

        this.simulation = forceSimulation()
            .velocityDecay(0.6)
            .force(
                "charge", 
                forceManyBody()
                    .distanceMax(distanceMax)
                    .strength(-500)
                    // .strength(-25 * nodeSizeAccessor(d))
            )
        // .force("x", forceX().strength(0.05))
            // .force("y", forceY().strength(0.2))
        // .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
            .force("link",
                forceLink()
                .id(d => d.id)
                // .distance(d => 50 + d.source.radius + d.target.radius)
                .distance(d => 50)
                .strength(
                    d => (d.weight ? d.weight * edgeStrength : edgeStrength)
                )
            )

        this.simulation.stop()

        const innerDragEvents = createInnerDrag(this)({
            // connect: onConnect,
            moveToAbstraction: this.props.moveToAbstraction,
        })

        this.drag = d3Drag()
            .on('drag', innerDragEvents.drag)
            .on('start', innerDragEvents.dragstart)
            .on('end', innerDragEvents.dragend)


        function moveElement(evt){
            dx = evt.clientX - currentX;
            dy = evt.clientY - currentY;
            currentMatrix[4] += dx;
            currentMatrix[5] += dy;
            newMatrix = "matrix(" + currentMatrix.join(' ') + ")";

            selectedElement.setAttributeNS(null, "transform", newMatrix);
            currentX = evt.clientX;
            currentY = evt.clientY;
        }

        this.state = {
            // necessary for dragging to work with react
            draggedElement: {
                id: null,
                x: null,
                y: null,
            },
        }
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.isLoading) {
            return false;
        }

        return true;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps !== this.props) {
            this.setState({ rerender: true })
        }
    }

    render() {
        // TODO: set the nodes and links here instead of in the graph - 2018-01-29

        const {
            // nodesBelowAbstraction,
            edgesBelowAbstraction,
            nodesWithAbstraction, // nodes both in and outside the abstraction
            nodesOutsideAbstraction,
            edgesOutsideAbstraction,
            nodeTree,
            showLinks,
            focusNode,
        } = this.props

        const {
            draggedElement,
            rerender
        } = this.state

        const tree = d3Tree()
        tree.nodeSize([25, 100])
        const treeData = tree(d3Hierarchy(nodeTree))
        const nodesBelowAbstraction = treeData.descendants()
        const nodesBelowAbstractionMap = _.keyBy(nodesBelowAbstraction, 'data.id')
        const hierarchyLinks = nodesBelowAbstraction.slice(1)

        let nodesById = {}
        nodesBelowAbstraction.forEach(node => {
            node.fx = node.x
            node.fy = node.y

            if (node.id === draggedElement.id) {
                node.fx = draggedElement.x
                node.fy = draggedElement.y
            }

            nodesById[node.data.id] = node
        })
        nodesOutsideAbstraction.forEach(node => {

            if (node.id === draggedElement.id) {
                node.x = draggedElement.x
                node.y = draggedElement.y
            }

            nodesById[node.id] = node
        })

        edgesOutsideAbstraction.forEach(link => {
            link.source = nodesById[link.start]
            link.target = nodesById[link.end]

            // link.opacity = strokeScale(link.count || 0)
        })

        this.nodesById = nodesById

        this.simulation.nodes([...nodesBelowAbstraction, ...nodesOutsideAbstraction])
        this.simulation.force("link").links(edgesOutsideAbstraction)

        if (this.simulation.alpha() < 0.1) {
            this.simulation.alpha(1)
        }

        // do the work before rendering
        if (this.state.rerender) {
            for (let i = 0; i < iterations; ++i) this.simulation.tick()
        }

        // console.log(nodesOutsideAbstraction, edgesOutsideAbstraction)

        const nodeOutsideElements = nodesOutsideAbstraction.map(node => (
            <NodeOutside
                key={node.id}
                node={node}
                drag={this.drag}
            />
        ))

        const edgeOutsideElements = edgesOutsideAbstraction.map(link => (
            <LinkOutside
                key={link.id}
                link={link}
            />
        ))

        return [
            <ZoomButtons
                zoomIn={() => this.zoom.zoomIn()}
                zoomOut={() => this.zoom.zoomOut()}
                zoomFit={() => this.zoom.zoomFit()}
                key="1"
            />,
            <ManipulationLayer key="2" { ...this.props }>
                { showLinks ? edgeOutsideElements : null }
                { showLinks ? nodeOutsideElements : null }
                <HierarchyGraph
                    nodes={nodesBelowAbstraction}
                    links={edgesBelowAbstraction}
                    hierarchyLinks={hierarchyLinks}
                    isLoading={this.props.isLoading}
                    showLinks={showLinks}
                />
            </ManipulationLayer>
        ]
    }
}

export default withRouter(ExploreGraph)


