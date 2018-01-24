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

import createZoom from '../zoom'
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

class Node extends React.Component {
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
                >{node.data.name}</text>
            </g>
        )
    }
}

class HierarchyLink extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { link } = this.props

        return (
            <path 
                className="hierarchy-link"
                d={ 
                    "M" + link.y + "," + link.x
                        + "C" + (link.y + link.parent.y) / 2 + "," + link.x
                        + " " + (link.y + link.parent.y) / 2 + "," + link.parent.x
                        + " " + link.parent.y + "," + link.parent.x
                }
            />
        )
    }
}

class Link extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { link } = this.props

        return (
            <path 
                className="link"
                d={ "M" + (link.source.y) + "," + (link.source.x) + "L" + (link.target.y) + "," + (link.target.x) }
            />
        )
    }
}

class NodeGraph extends React.Component {

    constructor(props) {
        super(props)

        this.onNodeClick = this.onNodeClick.bind(this)
        this.zoomed = this.zoomed.bind(this)

        this.tree = d3Tree()

        this.state = {
            containerTransform: `translate(${WIDTH/2}, ${HEIGHT/2})`
        }
    }

    onNodeClick(d) {
        if (currentEvent.defaultPrevented) return; // click suppressed

        // TODO: call expand action or edit action, whatever - 2017-12-31
        console.log("called click")
    }

    zoomed(transform) {
        this.setState({
            containerTransform: transform
        })
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

    render() {
        const { nodeTree, links, isLoading } = this.props

        const treeData = this.tree(d3Hierarchy(nodeTree))
        const nodes = treeData.descendants()
        const hierarchyLinks = treeData.descendants().slice(1)

        let nodesById = {}
        nodes.forEach(node => {
            nodesById[node.data.id] = node
        })

        links.forEach(link => {
            link.source = nodesById[link.start]
            link.target = nodesById[link.end]

            // link.opacity = strokeScale(link.count || 0)
        })

        // this.tree = this.tree.size([newHeight, WIDTH]);
        this.tree = this.tree.nodeSize([25, 100]);

        // Compute the new tree layout.

        // const maxLabelLength = 50;
        // // Set widths between levels based on maxLabelLength.
        // nodes.forEach(function(d) {
        //     d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
        // });

        const nodeElements = nodes.map(node => (
            <Node 
                key={node.id}
                node={node}
                onClick={this.onNodeClick}
                onDrag={this.onDrag}
            />
        ))

        const hierarchyLinkElements = hierarchyLinks.map(link => (
            <HierarchyLink
                key={link.id}
                link={link}
            />
        ))

        const linkElements = links.map(link => (
            <Link
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
                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="svg-content hierarchy-graph"
                    ref="graph"
                    key="2"
                >
                    <g ref="container" transform={this.state.containerTransform}>
                        { hierarchyLinkElements }
                        { linkElements }
                        { nodeElements }
                        { isLoading ? null : null }
                    </g>
                </svg>
        ]
    }
}

export default withRouter(NodeGraph)
