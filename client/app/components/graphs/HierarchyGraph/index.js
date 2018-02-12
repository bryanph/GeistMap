import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
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

import ContentAdd from 'material-ui/svg-icons/content/add-circle-outline'

import { dragElement } from '../../../actions/ui'

class Node extends React.Component {
    constructor(props) {
        super(props)

        this.onFocusClick = this.onFocusClick.bind(this)
    }

//     componentDidMount() {
//         const selection = d3Select(`#node-${this.props.node.data.id}`)
//         this.props.drag(selection)
//     }

    onFocusClick() {
        return this.props.onFocusClick(this.props.node.data.id)
    }

    render() {
        const {
            node,
            onClick,
            draggedElement,
        } = this.props

        // const x = draggedElement.id === node.data.id ? draggedElement.x : node.x;
        // const y = draggedElement.id === node.data.id ? draggedElement.y : node.y;

        const transform = `translate(${node.y}, ${node.x})`;

        const nodeClass = classNames({
            nodeActive: node.active
        }, 'node')

        return (
            <g
                className={ nodeClass }
                transform={transform}
            >
                <circle
                    className="nodeCircle"
                    r={node.radius}
                    onClick={() => onClick(node.data.id)}
                />
                <text 
                    className="nodeFocus"
                    x={ node.radius + 4 }
                    onClick={ this.onFocusClick }
                >{ '\u23FA' }</text>
                <text
                    className="nodeText"
                    x={node.children ? -node.radius-8 : (node.radius + 19)}
                    textAnchor={ node.children ? "end" : "start" }
                >{node.data.name}</text>
            </g>
        )
    }
}
Node = connect(
    (state) => ({ draggedElement: state.graphUiState.draggedElement }),
    { dragElement }
)(Node)

class HierarchyLink extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        const { link, draggedElement } = this.props

        // hide if dragging the node
        if (draggedElement.id === link.data.id) {
            return null;
        }

        return (
            <path 
                className="hierarchy-link"
                d={ 
                    [
                        "M",
                        link.y,
                        link.x,
                        "C",
                        (link.y + link.parent.y) / 2,
                        link.x,
                        (link.y + link.parent.y) / 2,
                        link.parent.x,
                        link.parent.y,
                        link.parent.x
                    ].join(' ')
                }
            />
        )
    }
}
HierarchyLink = connect(
    (state) => ({ draggedElement: state.graphUiState.draggedElement }),
    { dragElement }
)(HierarchyLink)

class NodeHierarchy extends React.Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const selection = d3Select(`#node-${this.props.node.data.id}`)
        this.props.drag(selection)
    }

    render() {
        const { node, draggedElement } = this.props

        const x = draggedElement.id === node.data.id ? draggedElement.dx : 0;
        const y = draggedElement.id === node.data.id ? draggedElement.dy : 0;

        const transform = `translate(${y}, ${x})`;

        return (
            <g 
                id={`node-${node.data.id}`}
                className="node-inside"
                transform={transform}
            >
                {
                    (node.children || []).map(link => (
                        <HierarchyLink
                            key={link.data.id}
                            link={link}
                        />
                    ))
                }
                <Node 
                    node={node}
                    onClick={this.props.onNodeClick}
                    onFocusClick={this.props.onNodeFocus}
                    showAddNodeWindow={this.props.showAddNodeWindow}
                    drag={this.props.drag}
                />
                { (node.children || []).map((node) => (
                    <NodeHierarchy {...this.props} key={node.data.id} node={ node } />
                )) }
            </g>
            
        )
    }
}
NodeHierarchy = connect(
    (state) => ({ draggedElement: state.graphUiState.draggedElement }),
    { dragElement }
)(NodeHierarchy)

class NodeGraph extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const {
            treeData,
            nodes,
            links,
            hierarchyLinks,
            showLinks,
        } = this.props

        let nodesById = {}
        nodes.forEach(node => {
            nodesById[node.data.id] = node
        })

        links.forEach(link => {
            link.source = nodesById[link.start]
            link.target = nodesById[link.end]

            // link.opacity = strokeScale(link.count || 0)
        })

        // Compute the new tree layout.

        // const maxLabelLength = 50;
        // // Set widths between levels based on maxLabelLength.
        // nodes.forEach(function(d) {
        //     d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
        // });

        // const nodeElements = nodes.map(node => (
        //     <Node 
        //         key={node.id}
        //         node={node}
        //         onClick={this.props.onNodeClick}
        //         onFocusClick={this.props.onNodeFocus}
        //         drag={this.props.drag}
        //     />
        // ))

        // const hierarchyElements = nestedGroupings(this.props.treeData)
        const hierarchyElements = (
            <NodeHierarchy
                node={this.props.treeData} 
                onNodeClick={this.props.onNodeClick}
                onNodeFocus={this.props.onNodeFocus}
                showAddNodeWindow={this.props.showAddNodeWindow}
                drag={this.props.drag}
            />
        )

        // const hierarchyLinkElements = hierarchyLinks.map(link => (
        //     <HierarchyLink
        //         key={link.id}
        //         link={link}
        //     />
        // ))

//         const linkElements = links
//             .filter(link => (
//                 !(
//                     link.source.data.id === ((link.target.parent) && link.target.parent.data.id)
//                     ||
//                     link.target.data.id === ((link.source.parent) && link.source.parent.data.id)
//                 )
//             ))
//             .map(link => (
//             <Link
//                 key={link.id}
//                 link={link}
//             />
//         ))

        return (
            <g className="hierarchy-graph">
                { /* nodeElements */ }
                { /* hierarchyLinkElements */ }
                { /* showLinks ? linkElements : null */ }
                { hierarchyElements }
            </g>
        )
    }
}

export default withRouter(NodeGraph)
