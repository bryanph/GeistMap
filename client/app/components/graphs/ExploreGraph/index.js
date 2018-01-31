
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

import './styles.scss'

class NodeOutside extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { node, onClick, onDrag } = this.props
        const transform = `translate(${node.y}, ${node.x})`;

        return (
            <g className="node" transform={transform} onClick={onClick} onDrag={onDrag}>
                <circle
                    className="nodeCircle"
                    r={4.5}
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

class ManipulationLayer extends React.Component {
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
        this.zoom.zoomFit()
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

class ExploreGraph extends React.PureComponent {

    constructor(props) {
        super(props)
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
        } = this.props

        const tree = d3Tree()
        tree.nodeSize([25, 100])
        const treeData = tree(d3Hierarchy(nodeTree))
        const nodesBelowAbstraction = treeData.descendants()
        const nodesBelowAbstractionMap = _.keyBy(nodesBelowAbstraction, 'data.id')
        const hierarchyLinks = treeData.descendants().slice(1)

        let nodesById = {}
        nodesBelowAbstraction.forEach(node => {
            nodesById[node.data.id] = node
            node.fx = node.x
            node.fy = node.y
        })
        nodesOutsideAbstraction.forEach(node => {
            nodesById[node.id] = node
        })

        edgesOutsideAbstraction.forEach(link => {
            link.source = nodesById[link.start]
            link.target = nodesById[link.end]

            // link.opacity = strokeScale(link.count || 0)
        })

        const iterations = 500;
        const edgeStrength = 0.2;
        const distanceMax = Infinity;

        const simulation = forceSimulation()
            .velocityDecay(0.2)
            .force(
                "charge", 
                forceManyBody()
                .distanceMax(distanceMax)
                .strength(-400)
                // .strength(-25 * nodeSizeAccessor(d))
            )

        // .force("x", forceX().strength(0.05))
        // .force("y", forceY().strength(0.05))
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

        simulation.nodes([...nodesBelowAbstraction, ...nodesOutsideAbstraction])
        simulation.force("link").links(edgesOutsideAbstraction)

        // if (simulation.alpha() < 0.1) {
        //     simulation.alpha(1)
        // }

        simulation.stop();

        // do the work before rendering
        for (let i = 0; i < iterations; ++i) simulation.tick()

        // console.log(nodesOutsideAbstraction, edgesOutsideAbstraction)

        const nodeOutsideElements = nodesOutsideAbstraction.map(node => (
            <NodeOutside
                key={node.id}
                node={node}
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
                { edgeOutsideElements }
                { nodeOutsideElements }
                <HierarchyGraph
                    nodes={nodesBelowAbstraction}
                    links={edgesBelowAbstraction}
                    hierarchyLinks={hierarchyLinks}
                    isLoading={this.props.isLoading}
                />
            </ManipulationLayer>
        ]
    }
}

export default withRouter(ExploreGraph)


