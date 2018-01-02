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

        console.log(node)

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
                    dy=".35m"
                    textAnchor={ node.children ? "end" : "start" }
                >{node.data.name}</text>
            </g>
        )
    }
}

class Link extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { link } = this.props

        console.log(link)

        return (
            <path 
                className="link"
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

class NodeGraph extends React.Component {

    constructor(props) {
        super(props)

        this.onNodeClick = this.onNodeClick.bind(this)
    }

    onNodeClick(d) {
        if (currentEvent.defaultPrevented) return; // click suppressed

        // TODO: call expand action or edit action, whatever - 2017-12-31
    }

    componentWillMount() {
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

        this.zoom = createZoom(this.graph, this.container, WIDTH, HEIGHT)
        this.tree = d3Tree()
        this.zoomed = false
    }

    render() {
        const { nodeTree, isLoading } = this.props

        if (isLoading) {
            // TODO: load a loading indicator somewhere - 2018-01-02
            return null;
        }

        const maxLabelLength = 50;

        var levelWidth = [1];
        var childCount = function(level, n) {
            if (!n.collapsed && n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, nodeTree);
        const newHeight = _.max(levelWidth) * 50; // 25 pixels per line  
        this.tree = this.tree.size([newHeight, WIDTH]);

        // Compute the new tree layout.
        const treeData = this.tree(d3Hierarchy(nodeTree))
        const nodes = treeData.descendants()
        const links = treeData.descendants().slice(1)

        // Set widths between levels based on maxLabelLength.
        // nodes.forEach(function(d) {
        //     d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
        // });

        const nodeElements = nodes.map(node => (
            <Node 
                node={node}
                onClick={this.onNodeClick}
                onDrag={this.onDrag}
            />
        ))

        const linkElements = links.map(link => (
            <Link
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
                    <g ref="container">
                        { nodeElements }
                        { linkElements }
                    </g>
                </svg>
        ]
    }
}

export default withRouter(NodeGraph)
